import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository, DataSource } from "typeorm";
import { randomBytes } from "crypto";
import { Schedules } from "../academic/Schedules";
import { QrCodes } from "./QrCodes";
import { StartAttendanceDto } from "./dto/attendance.dto";
import { Students } from "../users/Students";
import { ScanQrDto } from "./dto/scan-qr.dto";
import { AttendanceRecords } from "./AttendanceRecords";
import { Justifications } from "./Justifications";
import { CreateJustificationDto } from "./dto/create-justification.dto";
import { AccessLogs } from "./AccessLogs";
import { CreateAccessLogDto } from "./dto/create-access-log.dto";
import { UpdateJustificationDto } from "./dto/update-justification.dto";
import { GroupEnrollments } from "../academic/GroupEnrollments";

const QR_EXPIRATION_TIME = 30 * 1000;
const LATE_TOLERANCE_MINUTES = 10;

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Schedules)
    private readonly schedulesRepository: Repository<Schedules>,

    @InjectRepository(QrCodes)
    private readonly qrCodesRepository: Repository<QrCodes>,

    @InjectRepository(Students)
    private readonly studentsRepository: Repository<Students>,

    @InjectRepository(AttendanceRecords)
    private readonly attendanceRecordsRepository: Repository<AttendanceRecords>,

    @InjectRepository(Justifications)
    private readonly justificationsRepository: Repository<Justifications>,

    @InjectRepository(GroupEnrollments)
    private readonly groupEnrollmentRepo: Repository<GroupEnrollments>,

    @InjectRepository(AccessLogs)
    private readonly accessLogsRepository: Repository<AccessLogs>,

    private readonly dataSource: DataSource,
  ) {}

  // ASISTENCIAS & QR

  async start(dto: StartAttendanceDto) {
    const schedule = await this.findActiveSchedule(dto.scheduleId);

    if (!schedule.teacher) {
      throw new ConflictException(
        "El horario no tiene un profesor asignado.",
      );
    }

    const activeQr = await this.findActiveQr(dto.scheduleId);

    if (activeQr && activeQr.expiresAt > new Date()) {
      throw new ConflictException(
        "Ya existe un código QR activo para este horario y aún no ha caducado.",
      );
    }

    if (activeQr) {
      activeQr.isActive = false;
      await this.qrCodesRepository.save(activeQr);
    }

    const qr = this.qrCodesRepository.create({
      hashValue: this.generateQrHash(),
      schedule,
      teacher: schedule.teacher,
      expiresAt: new Date(Date.now() + QR_EXPIRATION_TIME),
      isActive: true,
    });

    await this.qrCodesRepository.save(qr);

    return {
      message: "QR generado exitosamente.",
      qrId: qr.id,
      scheduleId: schedule.id,
      hash: qr.hashValue,
      expiresAt: qr.expiresAt,
    };
  }

  private generateQrHash(): string {
    return randomBytes(32).toString("hex");
  }

  private async findActiveSchedule(scheduleId: string): Promise<Schedules> {
    const schedule = await this.schedulesRepository.findOne({
      where: {
        id: scheduleId,
        isActive: true,
      },
      relations: {
        teacher: true,
      },
    });

    if (!schedule) {
      throw new NotFoundException("Horario no encontrado o inactivo.");
    }
    return schedule;
  }

  private async findActiveQr(scheduleId: string): Promise<QrCodes | null> {
    return this.qrCodesRepository.findOne({
      where: {
        schedule: {
          id: scheduleId,
        },
        isActive: true,
      },
      order: {
        createdAt: "DESC",
      },
    });
  }

  async scanQr(studentId: string, dto: ScanQrDto) {
    const student = await this.studentsRepository.findOne({
      where: { userId: studentId },
    });

    if (!student) {
      throw new NotFoundException("Estudiante no encontrado.");
    }

    const qr = await this.qrCodesRepository.findOne({
      where: { hashValue: dto.qrHash, isActive: true },
      relations: { schedule: true },
    });

    if (!qr || qr.expiresAt < new Date()) {
      throw new BadRequestException(
        "El código QR no es válido o ha caducado.",
      );
    }

    const scheduleId = qr.schedule.id;
    const today = new Date().toISOString().split("T")[0];

    const existingRecord = await this.attendanceRecordsRepository.findOne({
      where: { studentId: student.id, scheduleId, recordedDate: today },
    });

    if (existingRecord) {
      throw new ConflictException(
        "El estudiante ya ha registrado asistencia para este horario hoy.",
      );
    }

    const qrCreatedAt = qr.createdAt
      ? new Date(qr.createdAt).getTime()
      : Date.now();
    const diffMinutes = (Date.now() - qrCreatedAt) / (1000 * 60);

    const status: "present" | "late" =
      diffMinutes > LATE_TOLERANCE_MINUTES ? "late" : "present";

    const record = this.attendanceRecordsRepository.create({
      studentId: student.id,
      scheduleId,
      status,
      qrHash: dto.qrHash,
      scanTimestamp: new Date(),
      recordedDate: today,
    });

    await this.attendanceRecordsRepository.save(record);

    return {
      message: "Asistencia registrada exitosamente.",
      studentId: student.id,
      scheduleId,
    };
  }

  // JUSTIFICATIONS

  async createJustification(dto: CreateJustificationDto) {
    const { studentId, registeredBy, justificationDate, reason, modules } = dto;

    // 1. Obtener día de la semana para Postgres (1 = Lunes, ..., 7 = Domingo)
    const [year, month, day] = justificationDate.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
    const jsDay = dateObj.getDay();
    const dayOfWeek = jsDay === 0 ? 7 : jsDay;

    let targetModules: number[] = [];

    // ESCENARIO 1: MÓDULOS ESPECIFICADOS
    if (modules && modules.length > 0) {
      targetModules = Array.from(new Set(modules));
    }
    // ESCENARIO 2: DÍA COMPLETO
    else {
      const enrollment = await this.groupEnrollmentRepo.findOne({
        where: { studentId },
      });

      if (!enrollment) {
        throw new NotFoundException(
          "El estudiante no se encuentra inscrito en ningún grupo activo.",
        );
      }

      const schedulesForDay = await this.schedulesRepository.find({
        where: {
          groupId: enrollment.groupId,
          dayOfWeek: dayOfWeek,
          isActive: true,
        },
      });

      if (schedulesForDay.length === 0) {
        throw new NotFoundException(
          "El alumno no tiene clases programadas para este día de la semana.",
        );
      }

      targetModules = schedulesForDay.map((_, index) => index + 1);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const recordsToInsert = targetModules.map((moduleNum) => {
        return queryRunner.manager.create(Justifications, {
          studentId,
          reason,
          justificationDate,
          moduleNumber: moduleNum,
          registeredBy: { id: registeredBy } as any,
          isActive: true,
        });
      });

      const savedRecords = await queryRunner.manager.save(
        Justifications,
        recordsToInsert,
      );

      await queryRunner.commitTransaction();

      return {
        message: modules?.length
          ? "Justificante registrado para los módulos seleccionados."
          : "Justificante registrado para todo el día.",
        totalRecords: savedRecords.length,
        data: savedRecords,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        `Error al guardar justificante: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findJustificationById(id: string) {
    const justification = await this.justificationsRepository.findOne({
      where: { id },
    });
    if (!justification) {
      throw new NotFoundException("Justificante no encontrado.");
    }
    return justification;
  }

  async updateJustification(id: string, dto: UpdateJustificationDto) {
    const justification = await this.findJustificationById(id);

    Object.assign(justification, dto);

    await this.justificationsRepository.save(justification);
    return {
      message: "Justificante actualizado correctamente.",
      justification,
    };
  }

  async removeJustification(id: string) {
    const justification = await this.findJustificationById(id);

    justification.isActive = false;
    await this.justificationsRepository.save(justification);

    return {
      message: "Justificante eliminado correctamente.",
    };
  }

  async findJustificationsByStudentId(studentId: string) {
    return this.justificationsRepository.find({
      where: { studentId, isActive: true },
      order: { justificationDate: "DESC" },
    });
  }

  async findJustificationsByStudentName(searchTerm: string) {
    if (!searchTerm || searchTerm.trim() === "") {
      return [];
    }

    const cleanTerm = searchTerm.trim();

    return this.justificationsRepository.find({
      where: [
        {
          student: {
            user: {
              firstName: ILike(`%${cleanTerm}%`),
            },
          },
          isActive: true,
        },
        {
          student: {
            user: {
              lastName: ILike(`%${cleanTerm}%`),
            },
          },
          isActive: true,
        },
      ],
      relations: {
        student: {
          user: true,
        },
      },
      order: {
        justificationDate: "DESC",
      },
    });
  }
   
//todos o filtrar por fecha
 async findAllJustifications(date?: string){
 const whereCondition: any = {isActive: true};

 if (date){
  whereCondition.justificationDate = date;
 }

  return this.justificationsRepository.find({
    where: whereCondition,
    relations: {
      student: {
          user:true,
      },
    },
    order: {
      justificationDate:'DESC',
      createdAt: 'DESC'
    },
  });

 }

  // ACCESS LOGS

  async createAccesLog(dto: CreateAccessLogDto) {
    const log = this.accessLogsRepository.create({
      studentId: dto.studentId,
      eventType: dto.eventType,
      scannedAt: dto.scannedAt,
      deviceTerminalId: dto.deviceTerminalId,
      isExitReturn: dto.isExitReturn,
      isSynced: true,
      syncedAt: new Date(),
    });

    await this.accessLogsRepository.save(log);

    return {
      message: "Registro de acceso guardado correctamente",
      log,
    };
  }

  async findAccessLogsByStudent(studentId: string) {
    return this.accessLogsRepository.find({
      where: { studentId },
      order: { scannedAt: "DESC" },
    });
  }

  async findAccessLogByStudentName(searchTerm: string) {
    if (!searchTerm || searchTerm.trim() === "") {
      return [];
    }
    const cleanTerm = searchTerm.trim();

    return this.accessLogsRepository.find({
      where: [
        {
          student: {
            user: {
              firstName: ILike(`%${cleanTerm}%`),
            },
          },
        },
        {
          student: {
            user: {
              lastName: ILike(`%${cleanTerm}%`),
            },
          },
        },
      ],
      relations: {
        student: {
          user: true,
        },
      },
      order: {
        scannedAt: "DESC",
      },
    });
  }
}