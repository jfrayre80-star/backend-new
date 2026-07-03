import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Classrooms } from './Classrooms';
import { ClassroomTypes } from './ClassroomTypes';

import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';

@Injectable()
export class ClassroomsService {

    constructor(
  @InjectRepository(Classrooms)
  private readonly classroomsRepository: Repository<Classrooms>,

  @InjectRepository(ClassroomTypes)
  private readonly classroomTypesRepository: Repository<ClassroomTypes>,
) {}

async findAll() {
  return await this.classroomsRepository.find({
    where: {
      isActive: true,
    },
    relations: {
      classroomType: true,
    },
  });
}

async findOne(id: string) {
  const classroom = await this.classroomsRepository.findOne({
    where: {
      id,
      isActive: true,
    },
    relations: {
      classroomType: true,
    },
  });

  if (!classroom) {
    throw new NotFoundException('Aula no encontrada.');
  }

  return classroom;
}

async create(createClassroomDto: CreateClassroomDto) {
  // Validar código único
  const existingClassroom = await this.classroomsRepository.findOne({
    where: {
      code: createClassroomDto.code,
    },
  });

  if (existingClassroom) {
    throw new ConflictException(
      'Ya existe un aula con ese código.',
    );
  }

  // Validar tipo de aula
  const classroomType = await this.classroomTypesRepository.findOne({
    where: {
      id: createClassroomDto.classroomTypeId,
      isActive: true,
    },
  });

  if (!classroomType) {
    throw new NotFoundException(
      'El tipo de aula no existe.',
    );
  }

  const classroom = this.classroomsRepository.create({
    name: createClassroomDto.name,
    code: createClassroomDto.code,
    capacity: createClassroomDto.capacity,
    building: createClassroomDto.building,
    floor: createClassroomDto.floor,
    hasEquipment: createClassroomDto.hasEquipment,
  });

  classroom.classroomType = classroomType;

  return await this.classroomsRepository.save(classroom);
}

async update(id: string, updateClassroomDto: UpdateClassroomDto) {
  const classroom = await this.findOne(id);

  // Validar código único si se modifica
  if (
    updateClassroomDto.code &&
    updateClassroomDto.code !== classroom.code
  ) {
    const existingClassroom = await this.classroomsRepository.findOne({
      where: {
        code: updateClassroomDto.code,
      },
    });

    if (existingClassroom) {
      throw new ConflictException(
        'Ya existe un aula con ese código.',
      );
    }
  }

  // Validar tipo de aula si se modifica
  if (updateClassroomDto.classroomTypeId) {
    const classroomType = await this.classroomTypesRepository.findOne({
      where: {
        id: updateClassroomDto.classroomTypeId,
        isActive: true,
      },
    });

    if (!classroomType) {
      throw new NotFoundException(
        'El tipo de aula no existe.',
      );
    }

    classroom.classroomType = classroomType;
  }

  Object.assign(classroom, {
    name: updateClassroomDto.name ?? classroom.name,
    code: updateClassroomDto.code ?? classroom.code,
    capacity: updateClassroomDto.capacity ?? classroom.capacity,
    building: updateClassroomDto.building ?? classroom.building,
    floor: updateClassroomDto.floor ?? classroom.floor,
    hasEquipment:
      updateClassroomDto.hasEquipment ?? classroom.hasEquipment,
  });

  return await this.classroomsRepository.save(classroom);
}

async remove(id: string) {
  const classroom = await this.findOne(id);

  classroom.isActive = false;

  return await this.classroomsRepository.save(classroom);
}
}
