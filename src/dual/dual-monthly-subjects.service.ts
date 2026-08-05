import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DualMonthlySubjects } from './DualMonthlySubjects';
import { DualEnrollments } from './DualEnrollments';
import { Subjects } from '../academic/Subjects';

import { CreateDualMonthlySubjectDto } from './dto/create-dual-monthly-subject.dto';
import { UpdateDualMonthlySubjectDto } from './dto/update-dual-monthly-subject.dto';

@Injectable()
export class DualMonthlySubjectsService {
  constructor(
    @InjectRepository(DualMonthlySubjects)
    private readonly dualMonthlySubjectsRepository: Repository<DualMonthlySubjects>,

    @InjectRepository(DualEnrollments)
    private readonly dualEnrollmentsRepository: Repository<DualEnrollments>,

    @InjectRepository(Subjects)
    private readonly subjectsRepository: Repository<Subjects>,
  ) {}

  /**
   * Lista todas las materias mensuales activas del programa dual.
   * Devuelve los registros ordenados por año (descendente) y luego por mes.
   */
  async findAll() {
    return await this.dualMonthlySubjectsRepository.find({
      order: {
        year: 'DESC',
        month: 'DESC',
      },
    });
  }

  /**
   * Busca una materia mensual por su id.
   * Se usa en findOne, update y remove para validar que exista.
   */
  async findOne(id: string) {
    const record = await this.dualMonthlySubjectsRepository.findOne({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException(
        'Materia mensual dual no encontrada.',
      );
    }

    return record;
  }

  /**
   * Lista las materias mensuales de una inscripción dual específica.
   * Útil para ver, por ejemplo, qué materias cursa un alumno en un mes dado.
   */
  async findByEnrollment(dualEnrollmentId: string) {
    return await this.dualMonthlySubjectsRepository.find({
      where: { dualEnrollmentId },
      order: { month: 'ASC', year: 'ASC' },
    });
  }

  /**
   * Crea una materia mensual dual.
   * Antes de insertar valida:
   *  1) Que la inscripción dual exista (FK).
   *  2) Que la materia exista (FK).
   *  3) Que no exista ya esa combinación alumno/materia/mes/año
   *     (la BD tiene un índice único compuesto para evitarlo).
   */
  async create(dto: CreateDualMonthlySubjectDto) {
    const enrollment = await this.dualEnrollmentsRepository.findOne({
      where: { id: dto.dualEnrollmentId },
    });

    if (!enrollment) {
      throw new NotFoundException(
        'La inscripción dual no existe.',
      );
    }

    const subject = await this.subjectsRepository.findOne({
      where: { id: dto.subjectId },
    });

    if (!subject) {
      throw new NotFoundException('La materia no existe.');
    }

    const existing = await this.dualMonthlySubjectsRepository.findOne({
      where: {
        dualEnrollmentId: dto.dualEnrollmentId,
        subjectId: dto.subjectId,
        month: dto.month,
        year: dto.year,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Esa materia ya está registrada para esa inscripción en el mismo mes y año.',
      );
    }

    const record = this.dualMonthlySubjectsRepository.create(dto);
    return await this.dualMonthlySubjectsRepository.save(record);
  }

  /**
   * Actualiza una materia mensual dual existente.
   * Si se cambia la inscripción o la materia, vuelve a validar que existan.
   * Se recalculan las validaciones de unicidad para no crear duplicados.
   */
  async update(id: string, dto: UpdateDualMonthlySubjectDto) {
    const record = await this.findOne(id);

    Object.assign(record, dto);

    if (dto.dualEnrollmentId) {
      const enrollment = await this.dualEnrollmentsRepository.findOne({
        where: { id: dto.dualEnrollmentId },
      });
      if (!enrollment) {
        throw new NotFoundException('La inscripción dual no existe.');
      }
    }

    if (dto.subjectId) {
      const subject = await this.subjectsRepository.findOne({
        where: { id: dto.subjectId },
      });
      if (!subject) {
        throw new NotFoundException('La materia no existe.');
      }
    }

    const existing = await this.dualMonthlySubjectsRepository.findOne({
      where: {
        dualEnrollmentId: record.dualEnrollmentId,
        subjectId: record.subjectId,
        month: record.month,
        year: record.year,
      },
    });

    if (existing && existing.id !== id) {
      throw new ConflictException(
        'Esa materia ya está registrada para esa inscripción en el mismo mes y año.',
      );
    }

    return await this.dualMonthlySubjectsRepository.save(record);
  }

  /**
   * Elimina (borrado físico) una materia mensual dual.
   * Se usa borrado físico porque es una tabla de configuración
   * sin historial que conservar; la relación con la inscripción
   * es la que da contexto, no la propia fila.
   */
  async remove(id: string) {
    const record = await this.findOne(id);
    await this.dualMonthlySubjectsRepository.remove(record);
    return { message: 'Materia mensual dual eliminada.' };
  }
}
