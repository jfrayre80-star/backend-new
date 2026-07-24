import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { PartialConfigs } from './PartialConfigs';
import { EvaluationSchemes } from './EvaluationSchemes';

import { CreatePartialConfigDto } from './dto/create-partial-config.dto';
import { UpdatePartialConfigDto } from './dto/update-partial-config.dto';

@Injectable()
export class PartialConfigsService {
    constructor(
  @InjectRepository(PartialConfigs)
  private readonly partialConfigsRepository: Repository<PartialConfigs>,

  @InjectRepository(EvaluationSchemes)
  private readonly evaluationSchemesRepository: Repository<EvaluationSchemes>,
) {}

private async validateEvaluationScheme(id: string) {
  const evaluationScheme =
    await this.evaluationSchemesRepository.findOne({
      where: { id },
    });

  if (!evaluationScheme) {
    throw new NotFoundException(
      `Evaluation Scheme con id ${id} no encontrado`,
    );
  }

  return evaluationScheme;
}

private async validateDuplicatePartial(
  evaluationSchemeId: string,
  partialNumber: number,
) {
  const existing =
    await this.partialConfigsRepository.findOne({
      where: {
        evaluationSchemeId,
        partialNumber,
      },
    });

  if (existing) {
    throw new ConflictException(
      `Ya existe el parcial ${partialNumber} para este esquema de evaluación`,
    );
  }
}

async create(createPartialConfigDto: CreatePartialConfigDto) {
  const { evaluationSchemeId, partialNumber } = createPartialConfigDto;

  await this.validateEvaluationScheme(evaluationSchemeId);

  await this.validateDuplicatePartial(
    evaluationSchemeId,
    partialNumber,
  );

  const partialConfig = this.partialConfigsRepository.create(
    createPartialConfigDto,
  );

  return await this.partialConfigsRepository.save(partialConfig);
}

async findAll() {
  return await this.partialConfigsRepository.find({
    relations: {
      evaluationScheme: true,
      partialComponents: true,
      partialGrades: true,
    },
    order: {
      partialNumber: 'ASC',
    },
  });
}

async findOne(id: string) {
  const partialConfig =
    await this.partialConfigsRepository.findOne({
      where: { id },
      relations: {
        evaluationScheme: true,
        partialComponents: true,
        partialGrades: true,
      },
    });

  if (!partialConfig) {
    throw new NotFoundException(
      `Partial Config con id ${id} no encontrado`,
    );
  }

  return partialConfig;
}

async update(
  id: string,
  updatePartialConfigDto: UpdatePartialConfigDto,
) {
  const partialConfig = await this.findOne(id);

  if (
    updatePartialConfigDto.evaluationSchemeId &&
    updatePartialConfigDto.evaluationSchemeId !==
      partialConfig.evaluationSchemeId
  ) {
    await this.validateEvaluationScheme(
      updatePartialConfigDto.evaluationSchemeId,
    );
  }

  const evaluationSchemeId =
    updatePartialConfigDto.evaluationSchemeId ??
    partialConfig.evaluationSchemeId;

  const partialNumber =
    updatePartialConfigDto.partialNumber ??
    partialConfig.partialNumber;

  const duplicate =
    await this.partialConfigsRepository.findOne({
      where: {
        evaluationSchemeId,
        partialNumber,
      },
    });

  if (duplicate && duplicate.id !== id) {
    throw new ConflictException(
      `Ya existe el parcial ${partialNumber} para este esquema de evaluación`,
    );
  }

  Object.assign(partialConfig, updatePartialConfigDto);

  return await this.partialConfigsRepository.save(
    partialConfig,
  );
}

async remove(id: string) {
  const partialConfig = await this.findOne(id);

  await this.partialConfigsRepository.remove(
    partialConfig,
  );

  return {
    message: 'Partial Config eliminado correctamente',
  };
}
}