import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ClassroomTypes } from '../classrooms/ClassroomTypes';

import { CreateClassroomTypeDto } from './dto/create-classroom-type.dto';
import { UpdateClassroomTypeDto } from './dto/update-classroom-type.dto';

@Injectable()
export class ClassroomTypesService {

    constructor(
  @InjectRepository(ClassroomTypes)
  private readonly classroomTypesRepository: Repository<ClassroomTypes>,
) {}

async findAll() {
  return await this.classroomTypesRepository.find({
    where: {
      isActive: true,
    },
  });
}

async findOne(id: string) {
  const classroomType = await this.classroomTypesRepository.findOne({
    where: {
      id,
      isActive: true,
    },
  });

  if (!classroomType) {
    throw new NotFoundException(
      'Tipo de aula no encontrado.',
    );
  }

  return classroomType;
}

async create(createDto: CreateClassroomTypeDto) {
  const existing = await this.classroomTypesRepository.findOne({
    where: {
      code: createDto.code,
    },
  });

  if (existing) {
    throw new ConflictException(
      'Ya existe un tipo de aula con ese código.',
    );
  }

  const classroomType =
    this.classroomTypesRepository.create(createDto);

  return await this.classroomTypesRepository.save(classroomType);
}

async update(
  id: string,
  updateDto: UpdateClassroomTypeDto,
) {
  const classroomType = await this.findOne(id);

  if (
    updateDto.code &&
    updateDto.code !== classroomType.code
  ) {
    const existing = await this.classroomTypesRepository.findOne({
      where: {
        code: updateDto.code,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Ya existe un tipo de aula con ese código.',
      );
    }
  }

  Object.assign(classroomType, updateDto);

  return await this.classroomTypesRepository.save(classroomType);
}

async remove(id: string) {
  const classroomType = await this.findOne(id);

  classroomType.isActive = false;

  return await this.classroomTypesRepository.save(classroomType);
}
}
