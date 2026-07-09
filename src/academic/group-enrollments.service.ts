import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupEnrollments } from './GroupEnrollments';
import { Groups } from './Groups';
import { Students } from '../users/Students';
import { CreateGroupEnrollmentDto } from './dto/create-group-enrollment.dto';
import { UpdateGroupEnrollmentDto } from './dto/update-group-enrollment.dto';

@Injectable()
export class GroupEnrollmentsService {
  constructor(
    @InjectRepository(GroupEnrollments)
    private readonly enrollmentRepository: Repository<GroupEnrollments>,
    @InjectRepository(Groups)
    private readonly groupsRepository: Repository<Groups>,
    @InjectRepository(Students)
    private readonly studentsRepository: Repository<Students>,
  ) {}

  async findAll() {
    return await this.enrollmentRepository.find({
      relations: { group: true, student: true },
    });
  }

  async findOne(id: string) {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id },
      relations: { group: true, student: true },
    });
    if (!enrollment) {
      throw new NotFoundException('Inscripción no encontrada.');
    }
    return enrollment;
  }

  async create(dto: CreateGroupEnrollmentDto) {
    const existing = await this.enrollmentRepository.findOne({
      where: { studentId: dto.studentId, groupId: dto.groupId },
    });
    if (existing) {
      throw new ConflictException('El estudiante ya está inscrito en este grupo.');
    }

    const group = await this.groupsRepository.findOne({ where: { id: dto.groupId, isActive: true } });
    if (!group) {
      throw new NotFoundException('Grupo no encontrado.');
    }

    const student = await this.studentsRepository.findOne({ where: { id: dto.studentId } });
    if (!student) {
      throw new NotFoundException('Estudiante no encontrado.');
    }

    const enrollment = this.enrollmentRepository.create(dto);
    return await this.enrollmentRepository.save(enrollment);
  }

  async update(id: string, dto: UpdateGroupEnrollmentDto) {
    const enrollment = await this.findOne(id);

    if (dto.studentId && dto.studentId !== enrollment.studentId) {
      const student = await this.studentsRepository.findOne({ where: { id: dto.studentId } });
      if (!student) {
        throw new NotFoundException('Estudiante no encontrado.');
      }
    }

    if (dto.groupId && dto.groupId !== enrollment.groupId) {
      const group = await this.groupsRepository.findOne({ where: { id: dto.groupId, isActive: true } });
      if (!group) {
        throw new NotFoundException('Grupo no encontrado.');
      }
    }

    Object.assign(enrollment, dto);
    return await this.enrollmentRepository.save(enrollment);
  }

  async remove(id: string) {
    const enrollment = await this.findOne(id);
    return await this.enrollmentRepository.remove(enrollment);
  }
}
