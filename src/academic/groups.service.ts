import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Groups } from './Groups';
import { Specialties } from './Specialties';
import { Semesters } from './Semesters';
import { Classrooms } from '../classrooms/Classrooms';

import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()

export class GroupsService {
    constructor(
  @InjectRepository(Groups)
  private readonly groupsRepository: Repository<Groups>,

  @InjectRepository(Specialties)
  private readonly specialtiesRepository: Repository<Specialties>,

  @InjectRepository(Semesters)
  private readonly semestersRepository: Repository<Semesters>,

  @InjectRepository(Classrooms)
  private readonly classroomsRepository: Repository<Classrooms>,
) {}

async findAll() {
  return await this.groupsRepository.find({
    where: {
      isActive: true,
    },
    relations: {
      specialty: true,
      semester: true,
      baseClassroom: true,
    },
  });
}

async findOne(id: string) {
  const group = await this.groupsRepository.findOne({
    where: {
      id,
      isActive: true,
    },
    relations: {
      specialty: true,
      semester: true,
      baseClassroom: true,
    },
  });

  if (!group) {
    throw new NotFoundException('Grupo no encontrado.');
  }

  return group;
}

async create(createGroupDto: CreateGroupDto) {
  const existing = await this.groupsRepository.findOne({
    where: {
      code: createGroupDto.code,
    },
  });

  if (existing) {
    throw new ConflictException(
      'Ya existe un grupo con ese código.',
    );
  }

  const group = this.groupsRepository.create(createGroupDto);

  if (createGroupDto.specialtyId) {
    const specialty = await this.specialtiesRepository.findOne({
      where: {
        id: createGroupDto.specialtyId,
        isActive: true,
      },
    });

    if (!specialty) {
      throw new NotFoundException(
        'Especialidad no encontrada.',
      );
    }

    group.specialty = specialty;
  }

  if (createGroupDto.semesterId) {
    const semester = await this.semestersRepository.findOne({
      where: {
        id: createGroupDto.semesterId,
        isActive: true,
      },
    });

    if (!semester) {
      throw new NotFoundException(
        'Semestre no encontrado.',
      );
    }

    group.semester = semester;
  }

  if (createGroupDto.baseClassroomId) {
    const classroom = await this.classroomsRepository.findOne({
      where: {
        id: createGroupDto.baseClassroomId,
        isActive: true,
      },
    });

    if (!classroom) {
      throw new NotFoundException(
        'Aula no encontrada.',
      );
    }

    group.baseClassroom = classroom;
  }

  return await this.groupsRepository.save(group);
}

async update(
  id: string,
  updateGroupDto: UpdateGroupDto,
) {
  const group = await this.findOne(id);

  if (
    updateGroupDto.code &&
    updateGroupDto.code !== group.code
  ) {
    const existing = await this.groupsRepository.findOne({
      where: {
        code: updateGroupDto.code,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Ya existe un grupo con ese código.',
      );
    }
  }

  Object.assign(group, updateGroupDto);

  if (updateGroupDto.specialtyId) {
    const specialty = await this.specialtiesRepository.findOne({
      where: {
        id: updateGroupDto.specialtyId,
        isActive: true,
      },
    });

    if (!specialty) {
      throw new NotFoundException(
        'Especialidad no encontrada.',
      );
    }

    group.specialty = specialty;
  }

  if (updateGroupDto.semesterId) {
    const semester = await this.semestersRepository.findOne({
      where: {
        id: updateGroupDto.semesterId,
        isActive: true,
      },
    });

    if (!semester) {
      throw new NotFoundException(
        'Semestre no encontrado.',
      );
    }

    group.semester = semester;
  }

  if (updateGroupDto.baseClassroomId) {
    const classroom = await this.classroomsRepository.findOne({
      where: {
        id: updateGroupDto.baseClassroomId,
        isActive: true,
      },
    });

    if (!classroom) {
      throw new NotFoundException(
        'Aula no encontrada.',
      );
    }

    group.baseClassroom = classroom;
  }

  return await this.groupsRepository.save(group);
}

async remove(id: string) {
  const group = await this.findOne(id);

  group.isActive = false;

  return await this.groupsRepository.save(group);
}
}