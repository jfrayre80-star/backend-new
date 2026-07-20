import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Activities } from './Activities';
import { PartialComponents } from './PartialComponents';

import { Subjects } from '../academic/Subjects';
import { Groups } from '../academic/Groups';
import { Teachers } from '../users/Teachers';

import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activities)
    private readonly activitiesRepository: Repository<Activities>,

    @InjectRepository(Subjects)
    private readonly subjectsRepository: Repository<Subjects>,

    @InjectRepository(Teachers)
    private readonly teachersRepository: Repository<Teachers>,

    @InjectRepository(Groups)
    private readonly groupsRepository: Repository<Groups>,

    @InjectRepository(PartialComponents)
    private readonly partialComponentsRepository: Repository<PartialComponents>,
  ) {}

  async findAll() {
    return await this.activitiesRepository.find({
      relations: {
        subject: true,
        teacher: true,
        group: true,
        partialComponent: true,
      },
    });
  }

  async findOne(id: string) {
    const activity = await this.activitiesRepository.findOne({
      where: { id },
      relations: {
        subject: true,
        teacher: true,
        group: true,
        partialComponent: true,
      },
    });

    if (!activity) {
      throw new NotFoundException('Actividad no encontrada');
    }

    return activity;
  }

  async create(createActivityDto: CreateActivityDto) {
  const subject = await this.subjectsRepository.findOne({
    where: {
      id: createActivityDto.subjectId,
      isActive: true,
    },
  });

  if (!subject) {
    throw new NotFoundException('Materia no encontrada');
  }

  const teacher = await this.teachersRepository.findOne({
    where: {
      id: createActivityDto.teacherId,
    },
  });

  if (!teacher) {
    throw new NotFoundException('Profesor no encontrado');
  }

  const group = await this.groupsRepository.findOne({
    where: {
      id: createActivityDto.groupId,
      isActive: true,
    },
  });

  if (!group) {
    throw new NotFoundException('Grupo no encontrado');
  }

  const partialComponent =
    await this.partialComponentsRepository.findOne({
      where: {
        id: createActivityDto.partialComponentId,
      },
    });

  if (!partialComponent) {
    throw new NotFoundException('Componente parcial no encontrado');
  }

  const activity = this.activitiesRepository.create({
    ...createActivityDto,
  });

  return await this.activitiesRepository.save(activity);
}

async update(
  id: string,
  updateActivityDto: UpdateActivityDto,
) {
  const activity = await this.findOne(id);

  if (updateActivityDto.subjectId) {
    const subject = await this.subjectsRepository.findOne({
      where: {
        id: updateActivityDto.subjectId,
        isActive: true,
      },
    });

    if (!subject) {
      throw new NotFoundException('Materia no encontrada');
    }
  }

  if (updateActivityDto.teacherId) {
    const teacher = await this.teachersRepository.findOne({
      where: {
        id: updateActivityDto.teacherId,
      },
    });

    if (!teacher) {
      throw new NotFoundException('Profesor no encontrado');
    }
  }

  if (updateActivityDto.groupId) {
    const group = await this.groupsRepository.findOne({
      where: {
        id: updateActivityDto.groupId,
        isActive: true,
      },
    });

    if (!group) {
      throw new NotFoundException('Grupo no encontrado');
    }
  }

  if (updateActivityDto.partialComponentId) {
    const partialComponent =
      await this.partialComponentsRepository.findOne({
        where: {
          id: updateActivityDto.partialComponentId,
        },
      });

    if (!partialComponent) {
      throw new NotFoundException(
        'Componente parcial no encontrado',
      );
    }
  }

  Object.assign(activity, updateActivityDto);

  return await this.activitiesRepository.save(activity);
}

async remove(id: string) {
  const activity = await this.findOne(id);

  await this.activitiesRepository.remove(activity);

  return {
    message: 'Actividad eliminada correctamente',
  };
}

}