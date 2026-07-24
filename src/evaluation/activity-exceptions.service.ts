import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ActivityExceptions } from './ActivityExceptions';
import { Activities } from './Activities';
import { Students } from '../users/Students';
import { Users } from '../users/Users';

import { CreateActivityExceptionDto } from './dto/create-activity-exception.dto';
import { UpdateActivityExceptionDto } from './dto/update-activity-exception.dto';

@Injectable()
export class ActivityExceptionsService {
  constructor(
    @InjectRepository(ActivityExceptions)
    private readonly activityExceptionsRepository: Repository<ActivityExceptions>,

    @InjectRepository(Activities)
    private readonly activitiesRepository: Repository<Activities>,

    @InjectRepository(Students)
    private readonly studentsRepository: Repository<Students>,

    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  private async validateActivity(
  activityId: string,
): Promise<Activities> {
  const activity = await this.activitiesRepository.findOne({
    where: { id: activityId },
  });

  if (!activity) {
    throw new NotFoundException(
      `Activity con id ${activityId} no encontrada`,
    );
  }

  return activity;
}

private async validateStudent(
  studentId: string,
): Promise<Students> {
  const student = await this.studentsRepository.findOne({
    where: { id: studentId },
  });

  if (!student) {
    throw new NotFoundException(
      `Student con id ${studentId} no encontrado`,
    );
  }

  return student;
}

private async validateUser(
  userId: string,
): Promise<Users> {
  const user = await this.usersRepository.findOne({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundException(
      `User con id ${userId} no encontrado`,
    );
  }

  return user;
}

private async validateDuplicate(
  activityId: string,
  studentId: string,
  excludeId?: string,
) {
  const exception =
    await this.activityExceptionsRepository.findOne({
      where: {
        activityId,
        studentId,
      },
    });

  if (
    exception &&
    (!excludeId || exception.id !== excludeId)
  ) {
    throw new ConflictException(
      'Ya existe una excepción para este alumno en esta actividad',
    );
  }
}

async create(
  createActivityExceptionDto: CreateActivityExceptionDto,
) {
  const {
    activityId,
    studentId,
    createdBy,
  } = createActivityExceptionDto;

  await this.validateActivity(activityId);
  await this.validateStudent(studentId);
  const user = await this.validateUser(createdBy);

  await this.validateDuplicate(
    activityId,
    studentId,
  );

  const exception =
    this.activityExceptionsRepository.create({
      activityId,
      studentId,
      reopenedUntil:
        createActivityExceptionDto.reopenedUntil,
      createdBy: user,
    });

  return await this.activityExceptionsRepository.save(
    exception,
  );
}

async findAll() {
  return await this.activityExceptionsRepository.find({
    relations: {
      activity: true,
      student: true,
      createdBy: true,
    },
    order: {
      createdAt: 'DESC',
    },
  });
}

async findOne(id: string) {
  const exception =
    await this.activityExceptionsRepository.findOne({
      where: { id },
      relations: {
        activity: true,
        student: true,
        createdBy: true,
      },
    });

  if (!exception) {
    throw new NotFoundException(
      `Activity Exception con id ${id} no encontrada`,
    );
  }

  return exception;
}

async update(
  id: string,
  updateActivityExceptionDto: UpdateActivityExceptionDto,
) {
  const exception = await this.findOne(id);

  const activityId =
    updateActivityExceptionDto.activityId ??
    exception.activityId;

  const studentId =
    updateActivityExceptionDto.studentId ??
    exception.studentId;

  if (
    updateActivityExceptionDto.activityId &&
    updateActivityExceptionDto.activityId !==
      exception.activityId
  ) {
    await this.validateActivity(activityId);
  }

  if (
    updateActivityExceptionDto.studentId &&
    updateActivityExceptionDto.studentId !==
      exception.studentId
  ) {
    await this.validateStudent(studentId);
  }

  if (updateActivityExceptionDto.createdBy) {
    const user = await this.validateUser(
      updateActivityExceptionDto.createdBy,
    );

    exception.createdBy = user;
  }

  await this.validateDuplicate(
    activityId,
    studentId,
    id,
  );

  Object.assign(exception, {
    activityId,
    studentId,
    reopenedUntil:
      updateActivityExceptionDto.reopenedUntil ??
      exception.reopenedUntil,
  });

  return await this.activityExceptionsRepository.save(
    exception,
  );
}

async remove(id: string) {
  const exception = await this.findOne(id);

  await this.activityExceptionsRepository.remove(
    exception,
  );

  return {
    message:
      'Activity Exception eliminada correctamente',
  };
}
}