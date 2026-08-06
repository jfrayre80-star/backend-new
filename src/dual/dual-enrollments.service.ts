import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DualEnrollments } from './DualEnrollments';
import { Students } from '../users/Students';
import { Teachers } from '../users/Teachers';
import { CompanyTutors } from './CompanyTutors';

import { CreateDualEnrollmentDto } from './dto/create-dual-enrollment.dto';
import { UpdateDualEnrollmentDto } from './dto/update-dual-enrollment.dto';

@Injectable()
export class DualEnrollmentsService {
  constructor(
    @InjectRepository(DualEnrollments)
    private readonly dualEnrollmentsRepository: Repository<DualEnrollments>,

    @InjectRepository(Students)
    private readonly studentsRepository: Repository<Students>,

    @InjectRepository(Teachers)
    private readonly teachersRepository: Repository<Teachers>,

    @InjectRepository(CompanyTutors)
    private readonly companyTutorsRepository: Repository<CompanyTutors>,
  ) {}

  /**
   * Lista todas las inscripciones duales activas con sus relaciones.
   * Se incluyen las relaciones para que el admin vea el binomio completo
   * (alumno, tutor de empresa y tutor académico).
   */
  async findAll() {
    return await this.dualEnrollmentsRepository.find({
      relations: {
        student: { user: true },
        companyTutor: true,
        academicTutor: { user: true },
      },
      order: { startDate: 'DESC' },
    });
  }

  /**
   * Busca una inscripción dual por su id.
   * Se usa en findOne, update y remove para validar que exista.
   */
  async findOne(id: string) {
    const record = await this.dualEnrollmentsRepository.findOne({
      where: { id },
      relations: {
        student: { user: true },
        companyTutor: true,
        academicTutor: { user: true },
        dualMonthlySubjects: true,
      },
    });

    if (!record) {
      throw new NotFoundException('Inscripción dual no encontrada.');
    }

    return record;
  }

  /**
   * Lista las inscripciones de un alumno concreto.
   * Como student_id es único, normalmente devuelve un solo registro,
   * pero se mantiene como lista por consistencia con el resto del módulo.
   */
  async findByStudent(studentId: string) {
    return await this.dualEnrollmentsRepository.find({
      where: { studentId },
      relations: {
        companyTutor: true,
        academicTutor: { user: true },
        dualMonthlySubjects: true,
      },
    });
  }

  /**
   * Crea una inscripción dual.
   * Antes de insertar valida:
   *  1) Que el alumno exista.
   *  2) Que el tutor de empresa exista.
   *  3) Que el tutor académico (maestro) exista.
   *  4) Que el alumno no esté ya inscrito al programa dual
   *     (student_id es único en la BD).
   */
  async create(dto: CreateDualEnrollmentDto) {
    const student = await this.studentsRepository.findOne({
      where: { id: dto.studentId },
    });
    if (!student) {
      throw new NotFoundException('El alumno no existe.');
    }

    const companyTutor = await this.companyTutorsRepository.findOne({
      where: { id: dto.companyTutorId },
    });
    if (!companyTutor) {
      throw new NotFoundException('El tutor de empresa no existe.');
    }

    const academicTutor = await this.teachersRepository.findOne({
      where: { id: dto.academicTutorId },
    });
    if (!academicTutor) {
      throw new NotFoundException('El tutor académico no existe.');
    }

    const existing = await this.dualEnrollmentsRepository.findOne({
      where: { studentId: dto.studentId },
    });
    if (existing) {
      throw new ConflictException(
        'El alumno ya está inscrito al programa dual.',
      );
    }

    const record = this.dualEnrollmentsRepository.create(dto);
    return await this.dualEnrollmentsRepository.save(record);
  }

  /**
   * Actualiza una inscripción dual existente.
   * Si se cambia el alumno, el tutor de empresa o el académico,
   * vuelve a validar que existan y que no haya duplicados.
   */
  async update(id: string, dto: UpdateDualEnrollmentDto) {
    const record = await this.findOne(id);

    if (dto.studentId) {
      const student = await this.studentsRepository.findOne({
        where: { id: dto.studentId },
      });
      if (!student) {
        throw new NotFoundException('El alumno no existe.');
      }
      const existing = await this.dualEnrollmentsRepository.findOne({
        where: { studentId: dto.studentId },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          'El alumno ya está inscrito al programa dual.',
        );
      }
    }

    if (dto.companyTutorId) {
      const companyTutor = await this.companyTutorsRepository.findOne({
        where: { id: dto.companyTutorId },
      });
      if (!companyTutor) {
        throw new NotFoundException('El tutor de empresa no existe.');
      }
    }

    if (dto.academicTutorId) {
      const academicTutor = await this.teachersRepository.findOne({
        where: { id: dto.academicTutorId },
      });
      if (!academicTutor) {
        throw new NotFoundException('El tutor académico no existe.');
      }
    }

    Object.assign(record, dto);
    return await this.dualEnrollmentsRepository.save(record);
  }

  /**
   * Elimina (borrado físico) una inscripción dual.
   * Es una tabla de configuración sin historial que conservar;
   * las materias mensuales relacionadas se eliminan en cascada en la BD.
   */
  async remove(id: string) {
    const record = await this.findOne(id);
    await this.dualEnrollmentsRepository.remove(record);
    return { message: 'Inscripción dual eliminada.' };
  }
}
