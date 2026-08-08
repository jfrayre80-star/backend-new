import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";

import { WeeklyLogs } from "./WeeklyLogs";
import { Students } from "../users/Students";
import { Subjects } from "../academic/Subjects";

import { FormatsService } from "../formats/formats.service";

import {
  CreateWeeklyLogDto,
  GradeWeeklyLogDto,
} from "./dto/create-weekly-log.dto";
import { UpdateWeeklyLogDto } from "./dto/update-weekly-log.dto";

@Injectable()
export class WeeklyLogsService {
  constructor(
    @InjectRepository(WeeklyLogs)
    private readonly weeklyLogsRepository: Repository<WeeklyLogs>,

    @InjectRepository(Students)
    private readonly studentsRepository: Repository<Students>,

    @InjectRepository(Subjects)
    private readonly subjectsRepository: Repository<Subjects>,

    private readonly formatsService: FormatsService,
  ) {}

  /**
   * Lista todas las bitácoras semanales con la información del alumno.
   * Se ordenan por año y número de semana descendente para que
   * las más recientes aparezcan primero.
   */
  async findAll() {
    return await this.weeklyLogsRepository.find({
      relations: { student: { user: true }, subject: true },
      order: { year: "DESC", weekNumber: "DESC" },
    });
  }

  /**
   * Busca una bitácora semanal por su id.
   * Se usa en findOne, update y remove para validar que exista.
   */
  async findOne(id: string) {
    const log = await this.weeklyLogsRepository.findOne({
      where: { id },
      relations: { student: { user: true }, subject: true },
    });

    if (!log) {
      throw new NotFoundException("Bitácora semanal no encontrada.");
    }

    return log;
  }

  /**
   * Lista las bitácoras de un alumno concreto, opcionalmente
   * filtradas por materia. Sirve para ver el historial semanal
   * del alumno dentro de una empresa.
   */
  async findByStudent(studentId: string, subjectId?: string) {
    return await this.weeklyLogsRepository.find({
      where: { studentId, ...(subjectId ? { subjectId } : {}) },
      relations: { subject: true },
      order: { year: "DESC", weekNumber: "DESC" },
    });
  }

  /**
   * Valida que el contenido (metadata) de una bitácora cumpla con el formato
   * institucional por defecto de bitácoras semanales (RF-47).
   *
   * Si el sistema tiene un formato institucional activo, verifica que estén
   * presentes las secciones obligatorias. Si no hay formato configurado, la
   * validación se omite para no bloquear el flujo.
   */
  private async validateFormatMetadata(metadata?: object) {
    if (!metadata || typeof metadata !== "object") {
      return;
    }

    const format = await this.formatsService.findDefaultBitacora();
    if (!format) {
      return;
    }

    const missing = format.sections
      .filter((section) => section.required)
      .map((section) => section.key)
      .filter((key) => {
        const value = (metadata as Record<string, unknown>)[key];
        return (
          value === undefined ||
          value === null ||
          (typeof value === "string" && value.trim() === "")
        );
      });

    if (missing.length > 0) {
      throw new BadRequestException(
        `La bitácora no cumple con el formato institucional. Faltan las secciones obligatorias: ${missing.join(", ")}.`,
      );
    }
  }

  /**
   * Crea una bitácora semanal.
   * Antes de insertar valida:
   *  1) Que el alumno exista.
   *  2) Que la materia exista (si se envía).
   *  3) Que no exista ya esa combinación alumno/materia/semana/año
   *     (la BD tiene un índice único compuesto para evitarlo).
   *  4) Que el contenido cumpla con el formato institucional (RF-47).
   */
  async create(dto: CreateWeeklyLogDto) {
    const student = await this.studentsRepository.findOne({
      where: { id: dto.studentId },
    });
    if (!student) {
      throw new NotFoundException("El alumno no existe.");
    }

    if (dto.subjectId) {
      const subject = await this.subjectsRepository.findOne({
        where: { id: dto.subjectId },
      });
      if (!subject) {
        throw new NotFoundException("La materia no existe.");
      }
    }

    const existing = await this.weeklyLogsRepository.findOne({
      where: {
        studentId: dto.studentId,
        subjectId: dto.subjectId ?? IsNull(),
        weekNumber: dto.weekNumber,
        year: dto.year,
      },
    });

    if (existing) {
      throw new ConflictException(
        "Ya existe una bitácora para ese alumno, materia, semana y año.",
      );
    }

    await this.validateFormatMetadata(dto.metadata);

    const log = this.weeklyLogsRepository.create({
      ...dto,
      submittedAt: dto.submittedAt ? new Date(dto.submittedAt) : new Date(),
    });
    return await this.weeklyLogsRepository.save(log);
  }

  /**
   * Actualiza una bitácora semanal existente.
   * Si se cambia el alumno o la materia, vuelve a validar que existan
   * y se recalculan las validaciones de unicidad.
   */
  async update(id: string, dto: UpdateWeeklyLogDto) {
    const log = await this.findOne(id);

    if (dto.studentId) {
      const student = await this.studentsRepository.findOne({
        where: { id: dto.studentId },
      });
      if (!student) {
        throw new NotFoundException("El alumno no existe.");
      }
    }

    if (dto.subjectId) {
      const subject = await this.subjectsRepository.findOne({
        where: { id: dto.subjectId },
      });
      if (!subject) {
        throw new NotFoundException("La materia no existe.");
      }
    }

    Object.assign(log, dto);

    const existing = await this.weeklyLogsRepository.findOne({
      where: {
        studentId: log.studentId,
        subjectId: log.subjectId ?? IsNull(),
        weekNumber: log.weekNumber,
        year: log.year,
      },
    });

    if (existing && existing.id !== id) {
      throw new ConflictException(
        "Ya existe una bitácora para ese alumno, materia, semana y año.",
      );
    }

    await this.validateFormatMetadata(log.metadata ?? undefined);

    return await this.weeklyLogsRepository.save(log);
  }

  /**
   * Califica una bitácora. Se usa tanto para la retroalimentación
   * de la empresa como para la del tutor académico, por separado.
   */
  async grade(id: string, dto: GradeWeeklyLogDto) {
    const log = await this.findOne(id);

    if (dto.companyFeedback !== undefined) {
      log.companyFeedback = dto.companyFeedback;
    }
    if (dto.academicFeedback !== undefined) {
      log.academicFeedback = dto.academicFeedback;
    }
    if (dto.companyGrade !== undefined) {
      log.companyGrade = dto.companyGrade;
    }
    if (dto.academicGrade !== undefined) {
      log.academicGrade = dto.academicGrade;
    }

    return await this.weeklyLogsRepository.save(log);
  }

  /**
   * Elimina (borrado físico) una bitácora semanal.
   * Se usa borrado físico porque es un registro de entrega que
   * no requiere conservar historial si se elimina por error.
   */
  async remove(id: string) {
    const log = await this.findOne(id);
    await this.weeklyLogsRepository.remove(log);
    return { message: "Bitácora semanal eliminada." };
  }
}
