import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThanOrEqual, In, MoreThanOrEqual } from "typeorm";

import { WeeklyLogs } from "../dual/WeeklyLogs";
import { Students } from "../users/Students";
import { DualEnrollments } from "../dual/DualEnrollments";
import { Activities } from "../evaluation/Activities";
import { ActivityDeliveries } from "../evaluation/ActivityDeliveries";
import { Submissions } from "../evaluation/Submissions";
import { GroupEnrollments } from "../academic/GroupEnrollments";
import { AttendanceRecords } from "../attendance/AttendanceRecords";
import { Alerts } from "../notifications/Alerts";

import { NotificationQueueService } from "../notifications/notification-queue.service";
import { AlertsService } from "../notifications/alerts.service";

/**
 * Constantes de configuración del motor de automatización.
 */
const RISK_ATTENDANCE_PERCENTAGE = 80; // Umbral de asistencia para alertar riesgo de reprobar.
const ACTIVITY_REMINDER_HOURS = 48; // Recordar actividades que vencen dentro de estas horas.
const REMINDER_DEDUPE_DAYS = 7; // No repetir el mismo recordatorio dentro de este periodo.

/**
 * Servicio de automatización (RF-48, RF-50 y RF-23).
 *
 * RF-48: Cron que revisa bitácoras semanales DUAL pendientes y actividades por
 * vencer, y encola recordatorios automáticos en segundo plano.
 *
 * RF-50: Cron que revisa la asistencia de los alumnos y dispara alertas
 * automáticas cuando un alumno está en riesgo de reprobar por faltas.
 *
 * RF-23: Métodos de consulta para el monitor de alumnos en riesgo.
 */
@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(
    @InjectRepository(WeeklyLogs)
    private readonly weeklyLogsRepository: Repository<WeeklyLogs>,

    @InjectRepository(Students)
    private readonly studentsRepository: Repository<Students>,

    @InjectRepository(DualEnrollments)
    private readonly dualEnrollmentsRepository: Repository<DualEnrollments>,

    @InjectRepository(Activities)
    private readonly activitiesRepository: Repository<Activities>,

    @InjectRepository(ActivityDeliveries)
    private readonly activityDeliveriesRepository: Repository<ActivityDeliveries>,

    @InjectRepository(Submissions)
    private readonly submissionsRepository: Repository<Submissions>,

    @InjectRepository(GroupEnrollments)
    private readonly groupEnrollmentsRepository: Repository<GroupEnrollments>,

    @InjectRepository(AttendanceRecords)
    private readonly attendanceRecordsRepository: Repository<AttendanceRecords>,

    @InjectRepository(Alerts)
    private readonly alertsRepository: Repository<Alerts>,

    private readonly notificationQueueService: NotificationQueueService,

    private readonly alertsService: AlertsService,
  ) {}

  // ─── HELPERS ───

  /**
   * Calcula el número de la semana ISO actual para comparar con las bitácoras.
   */
  private getIsoWeek(date: Date): number {
    const target = new Date(date.getTime());
    target.setHours(0, 0, 0, 0);
    target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7));
    const week1 = new Date(target.getFullYear(), 0, 4);
    return (
      1 +
      Math.round(
        ((target.getTime() - week1.getTime()) / 86400000 -
          3 +
          ((week1.getDay() + 6) % 7)) /
          7,
      )
    );
  }

  /**
   * Obtiene el día en formato YYYY-MM-DD a partir de una fecha.
   */
  private toDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  /**
   * Calcula el porcentaje de asistencia efectiva de un alumno:
   * (presentes + retardos) / (total - faltas justificadas).
   */
  private calculateAttendancePercentage(records: AttendanceRecords[]): number {
    if (records.length === 0) return 100;

    let present = 0;
    let late = 0;
    let justified = 0;

    for (const record of records) {
      if (record.status === "present") present++;
      else if (record.status === "late") late++;
      else if (record.status === "justified_absence") justified++;
    }

    const effectiveClasses = records.length - justified;
    if (effectiveClasses <= 0) return 100;

    const attended = present + late;
    return Number(((attended / effectiveClasses) * 100).toFixed(2));
  }

  /**
   * Revisa si ya existe una alerta del mismo tipo para el alumno dentro del
   * periodo de deduplicación (evita notificar lo mismo una y otra vez).
   */
  private async hasRecentAlert(
    studentId: string,
    alertType: string,
  ): Promise<boolean> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - REMINDER_DEDUPE_DAYS);

    const existing = await this.alertsRepository.findOne({
      where: {
        studentId,
        alertType,
        createdAt: MoreThanOrEqual(cutoff),
      },
    });
    return !!existing;
  }

  // ─── RF-48: RECORDATORIOS DE BITÁCORAS SEMANALES DUAL ───

  /**
   * Encuentra los alumnos DUAL activos que aún no han entregado la bitácora de
   * la semana en curso y encola un recordatorio automático.
   */
  async runWeeklyLogReminders(): Promise<{ studentsReminded: number }> {
    const now = new Date();
    const currentWeek = this.getIsoWeek(now);
    const currentYear = now.getFullYear();

    const activeEnrollments = await this.dualEnrollmentsRepository.find({
      where: { isActive: true },
      relations: { student: { user: true, parent: true } },
    });

    let studentsReminded = 0;

    for (const enrollment of activeEnrollments) {
      const student = enrollment.student;
      if (!student) continue;

      const hasLog = await this.weeklyLogsRepository.findOne({
        where: {
          studentId: student.id,
          weekNumber: currentWeek,
          year: currentYear,
        },
      });

      if (hasLog) continue;

      const studentName = student.user
        ? `${student.user.firstName} ${student.user.lastName}`
        : "Alumno DUAL";

      await this.enqueueReminder({
        student,
        alertType: "dual_reminder",
        title: "Bitácora semanal pendiente",
        message: `Recordatorio: aún no has entregado la bitácora de la semana ${currentWeek}.`,
        payload: {
          studentId: student.id,
          studentName,
          weekNumber: currentWeek,
          year: currentYear,
          reminderFor: "weekly_log",
        },
      });

      studentsReminded++;
    }

    return { studentsReminded };
  }

  // ─── RF-48: RECORDATORIOS DE ACTIVIDADES POR VENCER ───

  /**
   * Encuentra actividades activas que vencen dentro de las próximas N horas y,
   * por cada alumno del grupo que aún no ha entregado, encola un recordatorio.
   */
  async runActivityReminders(): Promise<{ remindersGenerated: number }> {
    const now = new Date();
    const deadline = new Date(
      now.getTime() + ACTIVITY_REMINDER_HOURS * 60 * 60 * 1000,
    );

    const activities = await this.activitiesRepository.find({
      where: {
        status: "active",
        dueDate: LessThanOrEqual(deadline),
      },
      relations: { group: true },
    });

    let remindersGenerated = 0;

    for (const activity of activities) {
      const deliveries = await this.activityDeliveriesRepository.find({
        where: { activityId: activity.id },
      });

      const deliveriesIds = deliveries.map((d) => d.id);
      if (deliveriesIds.length === 0) continue;

      const enrollments = await this.groupEnrollmentsRepository.find({
        where: { groupId: activity.groupId },
        relations: { student: { user: true, parent: true } },
      });

      for (const enrollment of enrollments) {
        const student = enrollment.student;
        if (!student) continue;

        const submission = await this.submissionsRepository.findOne({
          where: {
            studentId: student.id,
            activityDeliveryId: In(deliveriesIds),
          },
        });

        if (submission) continue;

        const studentName = student.user
          ? `${student.user.firstName} ${student.user.lastName}`
          : "Alumno";

        await this.enqueueReminder({
          student,
          alertType: "dual_reminder",
          title: `Actividad por vencer: ${activity.title}`,
          message: `Tienes la actividad "${activity.title}" por entregar antes de ${activity.dueDate.toISOString()}.`,
          payload: {
            studentId: student.id,
            studentName,
            activityId: activity.id,
            dueDate: activity.dueDate.toISOString(),
            reminderFor: "activity",
          },
        });

        remindersGenerated++;
      }
    }

    return { remindersGenerated };
  }

  // ─── RF-50: ALERTAS AUTOMÁTICAS DE ASISTENCIA ───

  /**
   * Revisa el porcentaje de asistencia de todos los alumnos inscritos en
   * grupos y dispara una alerta automática a los que estén en riesgo de
   * reprobar por faltas (por debajo del umbral de asistencia).
   */
  async runAttendanceRiskAlerts(): Promise<{ studentsAlerted: number }> {
    const enrollments = await this.groupEnrollmentsRepository.find({
      relations: {
        student: { user: true, parent: true, groupEnrollments: true },
      },
    });

    const seen = new Set<string>();
    let studentsAlerted = 0;

    for (const enrollment of enrollments) {
      const student = enrollment.student;
      if (!student || seen.has(student.id)) continue;
      seen.add(student.id);

      const records = await this.attendanceRecordsRepository.find({
        where: { studentId: student.id },
      });

      const percentage = this.calculateAttendancePercentage(records);

      if (percentage >= RISK_ATTENDANCE_PERCENTAGE) continue;

      const alreadyAlerted = await this.hasRecentAlert(
        student.id,
        "risk_of_failure",
      );
      if (alreadyAlerted) continue;

      const studentName = student.user
        ? `${student.user.firstName} ${student.user.lastName}`
        : "Alumno";

      await this.enqueueReminder({
        student,
        alertType: "risk_of_failure",
        title: "Riesgo de reprobar por faltas",
        message: `Tu porcentaje de asistencia es del ${percentage}%. Mantente al pendiente para evitar reprobar la materia.`,
        payload: {
          studentId: student.id,
          studentName,
          attendancePercentage: percentage,
          threshold: RISK_ATTENDANCE_PERCENTAGE,
          reminderFor: "attendance_risk",
        },
      });

      studentsAlerted++;
    }

    return { studentsAlerted };
  }

  // ─── RF-23: MONITOR DE ALUMNOS EN RIESGO ───

  /**
   * Vista analítica para detectar alumnos en riesgo de reprobar por faltas.
   * Devuelve el porcentaje de asistencia y la cantidad de faltas de cada alumno
   * inscrito en un grupo (o de todos los grupos si no se filtra).
   */
  async getRiskMonitor(groupId?: string) {
    const where: { groupId?: string } = {};
    if (groupId) where.groupId = groupId;

    const enrollments = await this.groupEnrollmentsRepository.find({
      where,
      relations: { group: true, student: { user: true, parent: true } },
      order: { enrolledAt: "ASC" },
    });

    const results: Array<{
      studentId: string;
      fullName: string;
      groupId: string;
      attendancePercentage: number;
      isAtRisk: boolean;
      summary: {
        totalClasses: number;
        present: number;
        late: number;
        absent: number;
        justifiedAbsence: number;
      };
    }> = [];
    const seen = new Set<string>();

    for (const enrollment of enrollments) {
      const student = enrollment.student;
      if (!student || seen.has(student.id)) continue;
      seen.add(student.id);

      const records = await this.attendanceRecordsRepository.find({
        where: { studentId: student.id },
      });

      let present = 0;
      let late = 0;
      let absent = 0;
      let justified = 0;

      for (const record of records) {
        if (record.status === "present") present++;
        else if (record.status === "late") late++;
        else if (record.status === "absent") absent++;
        else if (record.status === "justified_absence") justified++;
      }

      const percentage = this.calculateAttendancePercentage(records);

      results.push({
        studentId: student.id,
        fullName: student.user
          ? `${student.user.firstName} ${student.user.lastName}`
          : "Alumno",
        groupId: enrollment.groupId,
        attendancePercentage: percentage,
        isAtRisk: percentage < RISK_ATTENDANCE_PERCENTAGE,
        summary: {
          totalClasses: records.length,
          present,
          late,
          absent,
          justifiedAbsence: justified,
        },
      });
    }

    // Ordenar: primero los alumnos en riesgo (por menor asistencia).
    results.sort((a, b) => {
      if (a.isAtRisk !== b.isAtRisk) return a.isAtRisk ? -1 : 1;
      return a.attendancePercentage - b.attendancePercentage;
    });

    return {
      threshold: RISK_ATTENDANCE_PERCENTAGE,
      totalStudents: results.length,
      studentsAtRisk: results.filter((r) => r.isAtRisk).length,
      students: results,
    };
  }

  // ─── CRON JOBS ───

  /**
   * Ejecuta los recordatorios de bitácoras y actividades todos los días a las 7:00 am.
   */
  @Cron(CronExpression.EVERY_DAY_AT_7AM)
  async handleDailyReminders() {
    try {
      const logs = await this.runWeeklyLogReminders();
      const activities = await this.runActivityReminders();
      this.logger.log(
        `Recordatorios generados: ${logs.studentsReminded} bitácoras, ${activities.remindersGenerated} actividades.`,
      );
    } catch (error) {
      this.logger.error("Error al generar recordatorios diarios.", error);
    }
  }

  /**
   * Dispara alertas de asistencia todos los días a las 7:30 am.
   */
  @Cron("30 7 * * *")
  async handleDailyRiskAlerts() {
    try {
      const result = await this.runAttendanceRiskAlerts();
      this.logger.log(
        `Alertas de asistencia generadas para ${result.studentsAlerted} alumnos.`,
      );
    } catch (error) {
      this.logger.error("Error al disparar alertas de asistencia.", error);
    }
  }

  // ─── UTILIDAD PARA ENCOLAR RECORDATORIOS ───

  /**
   * Crea una alerta persistente y encola una notificación push en segundo plano.
   * Se usa el mismo mecanismo para bitácoras, actividades y riesgo de asistencia.
   */
  private async enqueueReminder(params: {
    student: Students;
    alertType: string;
    title: string;
    message: string;
    payload: Record<string, unknown>;
  }) {
    const { student, alertType, title, message, payload } = params;

    const dedupeKey = `${alertType}:${String(payload.reminderFor)}:${this.toDateString(new Date())}`;

    const dedupe = await this.alertsRepository.findOne({
      where: { studentId: student.id, alertType, title },
      order: { createdAt: "DESC" },
    });

    if (dedupe && dedupe.createdAt) {
      const dedupeDate = this.toDateString(dedupe.createdAt);
      if (dedupeDate === this.toDateString(new Date())) {
        return;
      }
    }

    if (student.parentId) {
      try {
        await this.alertsService.create({
          studentId: student.id,
          parentId: student.parentId,
          alertType,
          title,
          message,
          metadata: { ...payload, dedupeKey },
        });
      } catch (error) {
        this.logger.warn(
          `No se pudo crear alerta para el alumno ${student.id}: ${error}`,
        );
      }
    }

    try {
      await this.notificationQueueService.create({
        type: "push",
        payload: {
          ...payload,
          message,
          title,
        },
      });
    } catch (error) {
      this.logger.warn(
        `No se pudo encolar notificación para el alumno ${student.id}: ${error}`,
      );
    }
  }
}
