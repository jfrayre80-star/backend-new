import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { PartialGrades } from './PartialGrades';
import { Students } from '../users/Students';
import { Subjects } from '../academic/Subjects';
import { PartialConfigs } from './PartialConfigs';

import { CreatePartialGradeDto } from './dto/create-partial-grade.dto';
import { UpdatePartialGradeDto } from './dto/update-partial-grade.dto';

@Injectable()
export class PartialGradesService {
  constructor(
    @InjectRepository(PartialGrades)
    private readonly partialGradesRepository: Repository<PartialGrades>,

    @InjectRepository(Students)
    private readonly studentsRepository: Repository<Students>,

    @InjectRepository(Subjects)
    private readonly subjectsRepository: Repository<Subjects>,

    @InjectRepository(PartialConfigs)
    private readonly partialConfigsRepository: Repository<PartialConfigs>,
  ) {}

  async findAll() {
  return await this.partialGradesRepository.find({
    relations: {
      student: true,
      subject: true,
      partialConfig: true,
    },
  });
}

async findOne(id: string) {
  const partialGrade = await this.partialGradesRepository.findOne({
    where: {
      id,
    },
    relations: {
      student: true,
      subject: true,
      partialConfig: true,
    },
  });

  if (!partialGrade) {
    throw new NotFoundException(
      'Calificación parcial no encontrada',
    );
  }

  return partialGrade;
}

async create(
  createPartialGradeDto: CreatePartialGradeDto,
) {
  const student = await this.studentsRepository.findOne({
    where: {
      id: createPartialGradeDto.studentId,
    },
  });

  if (!student) {
    throw new NotFoundException(
      'Alumno no encontrado',
    );
  }

  const subject = await this.subjectsRepository.findOne({
    where: {
      id: createPartialGradeDto.subjectId,
      isActive: true,
    },
  });

  if (!subject) {
    throw new NotFoundException(
      'Materia no encontrada',
    );
  }

  const partialConfig =
    await this.partialConfigsRepository.findOne({
      where: {
        id: createPartialGradeDto.partialConfigId,
      },
    });

  if (!partialConfig) {
    throw new NotFoundException(
      'Configuración de parcial no encontrada',
    );
  }

  const partialGrade =
    this.partialGradesRepository.create(
      createPartialGradeDto,
    );

  return await this.partialGradesRepository.save(
    partialGrade,
  );
}

async update(
  id: string,
  updatePartialGradeDto: UpdatePartialGradeDto,
) {
  const partialGrade = await this.findOne(id);

  if (updatePartialGradeDto.studentId) {
    const student = await this.studentsRepository.findOne({
      where: {
        id: updatePartialGradeDto.studentId,
      },
    });

    if (!student) {
      throw new NotFoundException('Alumno no encontrado');
    }
  }

  if (updatePartialGradeDto.subjectId) {
    const subject = await this.subjectsRepository.findOne({
      where: {
        id: updatePartialGradeDto.subjectId,
        isActive: true,
      },
    });

    if (!subject) {
      throw new NotFoundException('Materia no encontrada');
    }
  }

  if (updatePartialGradeDto.partialConfigId) {
    const partialConfig = await this.partialConfigsRepository.findOne({
      where: {
        id: updatePartialGradeDto.partialConfigId,
      },
    });

    if (!partialConfig) {
      throw new NotFoundException(
        'Configuración de parcial no encontrada',
      );
    }
  }

  Object.assign(partialGrade, updatePartialGradeDto);

  return await this.partialGradesRepository.save(partialGrade);
}

async remove(id: string) {
  const partialGrade = await this.findOne(id);

  await this.partialGradesRepository.remove(partialGrade);

  return {
    message: 'Calificación parcial eliminada correctamente',
  };
}
}