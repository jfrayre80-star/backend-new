import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedules } from './Schedules';
import { Teachers } from '../users/Teachers';
import { Groups } from './Groups';
import { Subjects } from './Subjects';
import { Classrooms } from '../classrooms/Classrooms';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { CheckOverlapDto } from './dto/check-overlap.dto';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedules)
    private readonly schedulesRepository: Repository<Schedules>,
    @InjectRepository(Teachers)
    private readonly teachersRepository: Repository<Teachers>,
    @InjectRepository(Groups)
    private readonly groupsRepository: Repository<Groups>,
    @InjectRepository(Subjects)
    private readonly subjectsRepository: Repository<Subjects>,
    @InjectRepository(Classrooms)
    private readonly classroomsRepository: Repository<Classrooms>,
  ) {}

  async findAll() {
    return this.schedulesRepository.find({
      where: { isActive: true },
      relations: { teacher: { user: true }, group: true, subject: true, classroom: true },
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });
  }

  async findOne(id: string) {
    const schedule = await this.schedulesRepository.findOne({
      where: { id, isActive: true },
      relations: { teacher: { user: true }, group: true, subject: true, classroom: true },
    });
    if (!schedule) throw new NotFoundException('Horario no encontrado.');
    return schedule;
  }

  async create(dto: CreateScheduleDto) {
    const teacher = await this.teachersRepository.findOne({
      where: { id: dto.teacherId },
      relations: { user: true },
    });
    if (!teacher) throw new NotFoundException('Profesor no encontrado.');
    if (!teacher.user?.isActive) throw new BadRequestException('El profesor no está activo.');

    const group = await this.groupsRepository.findOne({
      where: { id: dto.groupId, isActive: true },
    });
    if (!group) throw new NotFoundException('Grupo no encontrado o inactivo.');

    const subject = await this.subjectsRepository.findOne({
      where: { id: dto.subjectId, isActive: true },
    });
    if (!subject) throw new NotFoundException('Materia no encontrada o inactiva.');

    let classroom: Classrooms | null = null;
    if (dto.classroomId) {
      classroom = await this.classroomsRepository.findOne({
        where: { id: dto.classroomId, isActive: true },
      });
      if (!classroom) throw new NotFoundException('Aula no encontrada o inactiva.');
    }

    const conflicts = await this.checkOverlap({
      teacherId: dto.teacherId,
      groupId: dto.groupId,
      classroomId: dto.classroomId ?? undefined,
      dayOfWeek: dto.dayOfWeek,
      startTime: dto.startTime,
      endTime: dto.endTime,
    });

    if (conflicts.length > 0) {
      throw new ConflictException(this.buildConflictMessage(conflicts, dto.teacherId, dto.groupId, dto.classroomId ?? undefined));
    }

    const schedule = this.schedulesRepository.create({
      teacherId: dto.teacherId,
      groupId: dto.groupId,
      classroomId: dto.classroomId ?? null,
      classroomOverride: dto.classroomOverride ?? null,
      dayOfWeek: dto.dayOfWeek,
      startTime: dto.startTime,
      endTime: dto.endTime,
      semester: dto.semester,
    });

    schedule.teacher = teacher;
    schedule.group = group;
    schedule.subject = subject;
    if (classroom) schedule.classroom = classroom;

    return this.schedulesRepository.save(schedule);
  }

  async update(id: string, dto: UpdateScheduleDto) {
    const schedule = await this.findOne(id);

    let needsOverlapCheck = false;
    let newTeacherId = schedule.teacherId;
    let newGroupId = schedule.groupId;

    if (dto.teacherId !== undefined && dto.teacherId !== schedule.teacherId) {
      const teacher = await this.teachersRepository.findOne({
        where: { id: dto.teacherId },
        relations: { user: true },
      });
      if (!teacher) throw new NotFoundException('Profesor no encontrado.');
      if (!teacher.user?.isActive) throw new BadRequestException('El profesor no está activo.');
      schedule.teacher = teacher;
      schedule.teacherId = dto.teacherId;
      newTeacherId = dto.teacherId;
      needsOverlapCheck = true;
    }

    if (dto.groupId !== undefined && dto.groupId !== schedule.groupId) {
      const group = await this.groupsRepository.findOne({
        where: { id: dto.groupId, isActive: true },
      });
      if (!group) throw new NotFoundException('Grupo no encontrado o inactivo.');
      schedule.group = group;
      schedule.groupId = dto.groupId;
      newGroupId = dto.groupId;
      needsOverlapCheck = true;
    }

    if (dto.subjectId !== undefined && dto.subjectId !== schedule.subject?.id) {
      const subject = await this.subjectsRepository.findOne({
        where: { id: dto.subjectId, isActive: true },
      });
      if (!subject) throw new NotFoundException('Materia no encontrada o inactiva.');
      schedule.subject = subject;
    }

    if (dto.classroomId !== undefined && dto.classroomId !== schedule.classroomId) {
      if (dto.classroomId) {
        const classroom = await this.classroomsRepository.findOne({
          where: { id: dto.classroomId, isActive: true },
        });
        if (!classroom) throw new NotFoundException('Aula no encontrada o inactiva.');
        schedule.classroom = classroom;
        schedule.classroomId = dto.classroomId;
      } else {
        schedule.classroom = null;
        schedule.classroomId = null;
      }
      // RF-12: el aula cambia, hay que revalidar solapamientos.
      needsOverlapCheck = true;
    }

    if (dto.dayOfWeek !== undefined && dto.dayOfWeek !== schedule.dayOfWeek) {
      schedule.dayOfWeek = dto.dayOfWeek;
      needsOverlapCheck = true;
    }

    if (dto.startTime !== undefined && dto.startTime !== schedule.startTime) {
      schedule.startTime = dto.startTime;
      needsOverlapCheck = true;
    }

    if (dto.endTime !== undefined && dto.endTime !== schedule.endTime) {
      schedule.endTime = dto.endTime;
      needsOverlapCheck = true;
    }

    if (dto.classroomOverride !== undefined) {
      schedule.classroomOverride = dto.classroomOverride;
    }

    if (dto.semester !== undefined) {
      schedule.semester = dto.semester;
    }

    if (needsOverlapCheck) {
      const conflicts = await this.checkOverlap({
        teacherId: newTeacherId,
        groupId: newGroupId,
        classroomId: schedule.classroomId ?? undefined,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        excludeId: id,
      });

      if (conflicts.length > 0) {
        throw new ConflictException(this.buildConflictMessage(conflicts, newTeacherId, newGroupId, schedule.classroomId ?? undefined));
      }
    }

    return this.schedulesRepository.save(schedule);
  }

  async remove(id: string) {
    const schedule = await this.findOne(id);
    schedule.isActive = false;
    return this.schedulesRepository.save(schedule);
  }

  async checkOverlap(dto: CheckOverlapDto): Promise<Schedules[]> {
    const { teacherId, groupId, classroomId, dayOfWeek, startTime, endTime, excludeId } = dto;

    const query = this.schedulesRepository
      .createQueryBuilder('s')
      .where('s.day_of_week = :dayOfWeek', { dayOfWeek })
      .andWhere('s.is_active = true')
      .andWhere('(s.start_time, s.end_time) OVERLAPS (:startTime::time, :endTime::time)', {
        startTime,
        endTime,
      });

    // RF-12: además del profesor y el grupo, el aula es un recurso exclusivo.
    // La condición del aula se integra en el mismo filtro de solapamiento.
    query.andWhere(
      '(s.teacher_id = :teacherId OR s.group_id = :groupId' +
        (classroomId ? ' OR s.classroom_id = :classroomId' : '') +
        ')',
      {
        teacherId,
        groupId,
        ...(classroomId ? { classroomId } : {}),
      },
    );

    if (excludeId) {
      query.andWhere('s.id != :excludeId', { excludeId });
    }

    return query.getMany();
  }

  private buildConflictMessage(conflicts: Schedules[], teacherId: string, groupId: string, classroomId?: string): string {
    const messages: string[] = [];
    for (const c of conflicts) {
      if (c.teacherId === teacherId) {
        messages.push('El profesor ya tiene un horario en ese día y horario.');
      }
      if (c.groupId === groupId) {
        messages.push('El grupo ya tiene una materia asignada en ese día y horario.');
      }
      if (classroomId && c.classroomId === classroomId) {
        messages.push('El aula ya está ocupada en ese día y horario.');
      }
    }
    return [...new Set(messages)].join(' ');
  }
}