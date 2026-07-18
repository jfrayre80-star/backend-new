import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { EvaluationSchemes } from './EvaluationSchemes';
import { Subjects } from '../academic/Subjects';
import { Groups } from '../academic/Groups';
import { Teachers } from '../users/Teachers';

import { CreateEvaluationSchemeDto } from './dto/create-evaluation-scheme.dto';
import { UpdateEvaluationSchemeDto } from './dto/update-evaluation-scheme.dto';

@Injectable()
export class EvaluationSchemesService {
 constructor(
  @InjectRepository(EvaluationSchemes)
  private readonly evaluationSchemesRepository: Repository<EvaluationSchemes>,

  @InjectRepository(Subjects)
  private readonly subjectsRepository: Repository<Subjects>,

  @InjectRepository(Groups)
  private readonly groupsRepository: Repository<Groups>,

  @InjectRepository(Teachers)
  private readonly teachersRepository: Repository<Teachers>,
) {}

async findAll() {
  return await this.evaluationSchemesRepository.find({
    relations: {
      subject: true,
      teacher: true,
      group: true,
    },
  });
}

async findOne(id: string) {
  const scheme = await this.evaluationSchemesRepository.findOne({
    where: {
      id,
    },
    relations: {
      subject: true,
      teacher: true,
      group: true,
    },
  });

  if (!scheme) {
    throw new NotFoundException(
      'Esquema de evaluación no encontrado.',
    );
  }

  return scheme;
}

async create(
  createEvaluationSchemeDto: CreateEvaluationSchemeDto,
) {
  const {
    subjectId,
    teacherId,
    groupId,
    partialsWeight = 80,
    semesterWeight = 20,
  } = createEvaluationSchemeDto;

  // Verificar que exista la materia
  const subject = await this.subjectsRepository.findOne({
    where: {
      id: subjectId,
      isActive: true,
    },
  });

  if (!subject) {
    throw new NotFoundException(
      'La materia no existe.',
    );
  }

  // Verificar que exista el profesor
  const teacher = await this.teachersRepository.findOne({
  where: {
    id: teacherId,
  },
});

  if (!teacher) {
    throw new NotFoundException(
      'El profesor no existe.',
    );
  }

  // Verificar que exista el grupo
  const group = await this.groupsRepository.findOne({
    where: {
      id: groupId,
      isActive: true,
    },
  });

  if (!group) {
    throw new NotFoundException(
      'El grupo no existe.',
    );
  }

  // Validar que los porcentajes sumen 100
  const total =
    Number(partialsWeight) +
    Number(semesterWeight);

  if (total !== 100) {
    throw new BadRequestException(
      'Los porcentajes de parciales y semestre deben sumar 100.',
    );
  }

  // Verificar que no exista otro esquema igual
  const existingScheme =
    await this.evaluationSchemesRepository.findOne({
      where: {
        subjectId,
        teacherId,
        groupId,
      },
    });

  if (existingScheme) {
    throw new ConflictException(
      'Ya existe un esquema de evaluación para esa materia, profesor y grupo.',
    );
  }

  const evaluationScheme =
    this.evaluationSchemesRepository.create(
      createEvaluationSchemeDto,
    );

  return await this.evaluationSchemesRepository.save(
    evaluationScheme,
  );
}

async update(
  id: string,
  updateEvaluationSchemeDto: UpdateEvaluationSchemeDto,
) {
  const evaluationScheme = await this.findOne(id);

  const subjectId =
    updateEvaluationSchemeDto.subjectId ??
    evaluationScheme.subjectId;

  const teacherId =
    updateEvaluationSchemeDto.teacherId ??
    evaluationScheme.teacherId;

  const groupId =
    updateEvaluationSchemeDto.groupId ??
    evaluationScheme.groupId;

  const partialsWeight =
    updateEvaluationSchemeDto.partialsWeight ??
    evaluationScheme.partialsWeight;

  const semesterWeight =
    updateEvaluationSchemeDto.semesterWeight ??
    evaluationScheme.semesterWeight;

  // Validar materia
  const subject = await this.subjectsRepository.findOne({
    where: {
      id: subjectId,
      isActive: true,
    },
  });

  if (!subject) {
    throw new NotFoundException('La materia no existe.');
  }

  // Validar profesor
  const teacher = await this.teachersRepository.findOne({
    where: {
      id: teacherId,
    },
  });

  if (!teacher) {
    throw new NotFoundException('El profesor no existe.');
  }

  // Validar grupo
  const group = await this.groupsRepository.findOne({
    where: {
      id: groupId,
      isActive: true,
    },
  });

  if (!group) {
    throw new NotFoundException('El grupo no existe.');
  }

  // Validar porcentaje
  const total =
    Number(partialsWeight) +
    Number(semesterWeight);

  if (total !== 100) {
    throw new BadRequestException(
      'Los porcentajes de parciales y semestre deben sumar 100.',
    );
  }

  // Verificar combinación única
  const duplicated =
    await this.evaluationSchemesRepository.findOne({
      where: {
        subjectId,
        teacherId,
        groupId,
      },
    });

  if (duplicated && duplicated.id !== id) {
    throw new ConflictException(
      'Ya existe un esquema de evaluación para esa materia, profesor y grupo.',
    );
  }

  Object.assign(
    evaluationScheme,
    updateEvaluationSchemeDto,
  );

  return await this.evaluationSchemesRepository.save(
    evaluationScheme,
  );
}

async remove(id: string) {
  const evaluationScheme =
    await this.findOne(id);

  await this.evaluationSchemesRepository.remove(
    evaluationScheme,
  );

  return {
    message:
      'Esquema de evaluación eliminado correctamente.',
  };
}

}