import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExtraordinaryEnrollments } from './ExtraordinaryEnrollments';
import { Students } from '../users/Students';
import { Subjects } from './Subjects';
import { Groups } from './Groups';
import { Semesters } from './Semesters';
import { CreateExtraordinaryEnrollmentDto } from './dto/create-extraordinary-enrollment.dto';
import { UpdateExtraordinaryEnrollmentDto } from './dto/update-extraordinary-enrollment.dto';

@Injectable()
export class ExtraordinaryEnrollmentsService {
  constructor(
    @InjectRepository(ExtraordinaryEnrollments)
    private readonly enrollmentsRepository: Repository<ExtraordinaryEnrollments>,
    @InjectRepository(Students)
    private readonly studentsRepository: Repository<Students>,
    @InjectRepository(Subjects)
    private readonly subjectsRepository: Repository<Subjects>,
    @InjectRepository(Groups)
    private readonly groupsRepository: Repository<Groups>,
    @InjectRepository(Semesters)
    private readonly semestersRepository: Repository<Semesters>,
  ) {}

  // Retorna todas las inscripciones extraordinarias con sus relaciones
  async findAll() {
    return await this.enrollmentsRepository.find({
      relations: { student: true, subject: true, group: true, semester: true },
    });
  }

  // Busca una inscripción por ID, lanza error si no existe
  async findOne(id: string) {
    const enrollment = await this.enrollmentsRepository.findOne({
      where: { id },
      relations: { student: true, subject: true, group: true, semester: true },
    });
    if (!enrollment) {
      throw new NotFoundException('Inscripción extraordinaria no encontrada.');
    }
    return enrollment;
  }

  // Crea una inscripción extraordinaria validando que todas las FKs existan
  async create(dto: CreateExtraordinaryEnrollmentDto) {
    // Valida que el estudiante exista
    const student = await this.studentsRepository.findOne({
      where: { id: dto.studentId },
    });
    if (!student) {
      throw new NotFoundException('Estudiante no encontrado.');
    }

    // Valida que la materia exista y esté activa
    const subject = await this.subjectsRepository.findOne({
      where: { id: dto.subjectId, isActive: true },
    });
    if (!subject) {
      throw new NotFoundException('Materia no encontrada.');
    }

    // Valida que el grupo exista y esté activo
    const group = await this.groupsRepository.findOne({
      where: { id: dto.groupId, isActive: true },
    });
    if (!group) {
      throw new NotFoundException('Grupo no encontrado.');
    }

    // Valida que el semestre exista
    const semester = await this.semestersRepository.findOne({
      where: { id: dto.semesterId },
    });
    if (!semester) {
      throw new NotFoundException('Semestre no encontrado.');
    }

    // Valida que la calificación esté en rango 5.0-7.0 si se proporciona (RF-10)
    if (dto.finalGrade) {
      const grade = parseFloat(dto.finalGrade);
      if (grade < 5.0 || grade > 7.0) {
        throw new BadRequestException(
          'La calificación de extraordinario debe estar entre 5.0 y 7.0.',
        );
      }
    }

    const enrollment = this.enrollmentsRepository.create(dto);
    return await this.enrollmentsRepository.save(enrollment);
  }

  // Actualiza una inscripción existente, revalidando FKs si cambian
  async update(id: string, dto: UpdateExtraordinaryEnrollmentDto) {
    const enrollment = await this.findOne(id);

    if (dto.studentId && dto.studentId !== enrollment.studentId) {
      const student = await this.studentsRepository.findOne({
        where: { id: dto.studentId },
      });
      if (!student) throw new NotFoundException('Estudiante no encontrado.');
    }

    if (dto.subjectId && dto.subjectId !== enrollment.subjectId) {
      const subject = await this.subjectsRepository.findOne({
        where: { id: dto.subjectId, isActive: true },
      });
      if (!subject) throw new NotFoundException('Materia no encontrada.');
    }

    if (dto.groupId && dto.groupId !== enrollment.groupId) {
      const group = await this.groupsRepository.findOne({
        where: { id: dto.groupId, isActive: true },
      });
      if (!group) throw new NotFoundException('Grupo no encontrado.');
    }

    if (dto.semesterId && dto.semesterId !== enrollment.semesterId) {
      const semester = await this.semestersRepository.findOne({
        where: { id: dto.semesterId },
      });
      if (!semester) throw new NotFoundException('Semestre no encontrado.');
    }

    if (dto.finalGrade) {
      const grade = parseFloat(dto.finalGrade);
      if (grade < 5.0 || grade > 7.0) {
        throw new BadRequestException(
          'La calificación de extraordinario debe estar entre 5.0 y 7.0.',
        );
      }
    }

    Object.assign(enrollment, dto);
    return await this.enrollmentsRepository.save(enrollment);
  }

  // Elimina una inscripción
  async remove(id: string) {
    const enrollment = await this.findOne(id);
    await this.enrollmentsRepository.remove(enrollment);
    return { message: 'Inscripción extraordinaria eliminada correctamente.' };
  }
}
