import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { In, Repository } from 'typeorm';
import { ExamAttempts } from './ExamAttempts';
import { Exams } from './Exams';
import { Students } from '../users/Students';
import { Schedules } from '../academic/Schedules';
import { AttendanceRecords } from '../attendance/AttendanceRecords';
import { EvaluationSchemes } from '../evaluation/EvaluationSchemes';
import { CreateExamAttemptDto, GradeExamAttemptDto } from './dto/create-exam-attempt.dto';
import { UpdateExamAttemptDto } from './dto/update-exam-attempt.dto';

// RF-25: umbral por defecto de asistencia mínima cuando el examen no tiene
// esquema de evaluación asociado.
const DEFAULT_MIN_ATTENDANCE_PERCENTAGE = 60;

@Injectable()
export class ExamAttemptsService {
  constructor(
    @InjectRepository(ExamAttempts)
    private readonly attemptsRepository: Repository<ExamAttempts>,
    @InjectRepository(Exams)
    private readonly examsRepository: Repository<Exams>,
    @InjectRepository(Students)
    private readonly studentsRepository: Repository<Students>,
    @InjectRepository(Schedules)
    private readonly schedulesRepository: Repository<Schedules>,
    @InjectRepository(AttendanceRecords)
    private readonly attendanceRecordsRepository: Repository<AttendanceRecords>,
    @InjectRepository(EvaluationSchemes)
    private readonly evaluationSchemesRepository: Repository<EvaluationSchemes>,
  ) {}

  async findAll() {
    return await this.attemptsRepository.find({
      relations: { exam: true, student: true },
    });
  }

  async findOne(id: string) {
    const attempt = await this.attemptsRepository.findOne({
      where: { id },
      relations: { exam: true, student: true, examAnswers: true, focusLossLogs: true },
    });
    if (!attempt) throw new NotFoundException('Intento no encontrado.');
    return attempt;
  }

  // Inicia un nuevo intento de examen para un alumno
  async create(dto: CreateExamAttemptDto) {
    const exam = await this.examsRepository.findOne({ where: { id: dto.examId } });
    if (!exam) throw new NotFoundException('Examen no encontrado.');

    const student = await this.studentsRepository.findOne({ where: { id: dto.studentId } });
    if (!student) throw new NotFoundException('Estudiante no encontrado.');

    // RF-25: validar que el alumno tenga al menos 60% de asistencia en la materia
    // del examen antes de permitirle iniciar el intento.
    await this.validateMinimumAttendance(exam, dto.studentId);

    // Verificar que no exceda el máximo de intentos
    const attemptNumber = dto.attemptNumber || 1;
    const existingAttempts = await this.attemptsRepository.count({
      where: { examId: dto.examId, studentId: dto.studentId },
    });

    if (existingAttempts >= (exam.maxAttempts || 1)) {
      throw new BadRequestException(`El alumno ya agotó sus ${exam.maxAttempts} intentos.`);
    }

    const attempt = this.attemptsRepository.create({
      ...dto,
      attemptNumber,
      status: 'in_progress',
      startedAt: new Date(),
    });
    return await this.attemptsRepository.save(attempt);
  }

  // RF-35: calcula la fecha/hora en la que expira el intento según el límite
  // de tiempo configurado en el examen (time_limit_minutes).
  getExpiresAt(attempt: ExamAttempts, exam: Exams): Date | null {
    if (!attempt.startedAt) return null;
    const minutes = exam.timeLimitMinutes || 0;
    return new Date(attempt.startedAt.getTime() + minutes * 60_000);
  }

  // RF-36/37: verifica si el intento ya rebasó su límite de tiempo.
  isExpired(attempt: ExamAttempts, exam: Exams): boolean {
    const expiresAt = this.getExpiresAt(attempt, exam);
    return !!expiresAt && expiresAt.getTime() <= Date.now();
  }

  // RF-38: cierre forzado de intentos que agotaron el tiempo o el límite de
  // pérdidas de foco. Corre cada minuto.
  @Cron(CronExpression.EVERY_MINUTE)
  async closeExpiredAttempts(): Promise<number> {
    const attempts = await this.attemptsRepository.find({
      where: { status: 'in_progress' },
      relations: { exam: true },
    });

    let closed = 0;
    for (const attempt of attempts) {
      if (this.isExpired(attempt, attempt.exam)) {
        attempt.status = 'closed';
        attempt.completedAt = new Date();
        await this.attemptsRepository.save(attempt);
        closed++;
      }
    }
    return closed;
  }

  // Califica un intento (manual o automática)
  async grade(id: string, dto: GradeExamAttemptDto) {
    const attempt = await this.findOne(id);

    if (attempt.status === 'graded' || attempt.status === 'closed') {
      throw new BadRequestException('Este intento ya fue calificado.');
    }

    if (dto.manualScore !== undefined) {
      attempt.manualScore = dto.manualScore;
    }

    if (dto.isAutoGraded !== undefined) {
      attempt.isAutoGraded = dto.isAutoGraded;
    }

    // Calcular total: suma de auto_score + manual_score
    const auto = parseFloat(attempt.autoScore || '0');
    const manual = parseFloat(attempt.manualScore || '0');
    attempt.totalScore = (auto + manual).toFixed(2);

    attempt.status = 'graded';
    attempt.completedAt = new Date();
    return await this.attemptsRepository.save(attempt);
  }

  // Registra pérdida de foco y verifica si excede el límite
  async logFocusLoss(id: string) {
    const attempt = await this.findOne(id);
    const exam = await this.examsRepository.findOne({ where: { id: attempt.examId } });

    // RF-40: la 3ª pérdida (maxFocusLosses) debe cerrar el intento, no la 4ª.
    // Antes se usaba `>` y se cerraba recién al superar el límite.
    if (attempt.status === 'closed' || attempt.status === 'graded') {
      throw new BadRequestException('El intento ya está cerrado o calificado.');
    }

    attempt.focusLossCount = (attempt.focusLossCount || 0) + 1;

    if (exam && attempt.focusLossCount >= (exam.maxFocusLosses || 3)) {
      attempt.status = 'closed';
      attempt.completedAt = new Date();
    }

    return await this.attemptsRepository.save(attempt);
  }

  async update(id: string, dto: UpdateExamAttemptDto) {
    const attempt = await this.findOne(id);
    Object.assign(attempt, dto);
    return await this.attemptsRepository.save(attempt);
  }

  async remove(id: string) {
    const attempt = await this.findOne(id);
    await this.attemptsRepository.remove(attempt);
    return { message: 'Intento eliminado correctamente.' };
  }

  /**
   * RF-25 — Filtro de restricción del derecho a examen.
   * Calcula el porcentaje de asistencia del alumno en los horarios activos de la
   * materia que evalúa el examen. Si es menor al umbral configurado en el
   * esquema de evaluación (evaluation_schemes.attendance_minimum_percent) se
   * rechaza el intento. Sin esquema se usa el 60% por defecto.
   * Las faltas justificadas no cuentan como clases efectivas.
   */
  private async validateMinimumAttendance(exam: Exams, studentId: string) {
    const schedules = await this.schedulesRepository.find({
      where: { subjectId: exam.subjectId, isActive: true },
    });

    // Sin horarios registrados para la materia no hay contra qué validar,
    // así que no se bloquea el derecho a examen.
    if (schedules.length === 0) {
      return;
    }

    const records = await this.attendanceRecordsRepository.find({
      where: {
        studentId,
        scheduleId: In(schedules.map((s) => s.id)),
      },
    });

    const total = records.length;
    const justified = records.filter((r) => r.status === 'justified_absence').length;
    const effective = total - justified;

    // Sin historial de asistencias no hay evidencia para restringir.
    if (effective === 0) {
      return;
    }

    // RF-25: el umbral se toma del esquema de evaluación si existe.
    let minimumPercent = DEFAULT_MIN_ATTENDANCE_PERCENTAGE;
    if (exam.evaluationSchemeId) {
      const scheme = await this.evaluationSchemesRepository.findOne({
        where: { id: exam.evaluationSchemeId },
      });
      if (scheme?.attendanceMinimumPercent) {
        minimumPercent = parseFloat(scheme.attendanceMinimumPercent);
      }
    }

    const attended = records.filter(
      (r) => r.status === 'present' || r.status === 'late',
    ).length;

    const percentage = (attended / effective) * 100;

    if (percentage < minimumPercent) {
      throw new ForbiddenException(
        `El alumno no cumple el mínimo de ${minimumPercent}% de asistencia ` +
          `en la materia (tiene ${percentage.toFixed(2)}%).`,
      );
    }
  }
}
