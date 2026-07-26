import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { ComponentScores } from './ComponentScores';
import { PartialComponents } from './PartialComponents';
import { PartialGrades } from './PartialGrades';

import { CreateComponentScoreDto } from './dto/create-component-score.dto';
import { UpdateComponentScoreDto } from './dto/update-component-score.dto';

@Injectable()
export class ComponentScoresService {
  constructor(
    @InjectRepository(ComponentScores)
    private readonly componentScoresRepository: Repository<ComponentScores>,

    @InjectRepository(PartialComponents)
    private readonly partialComponentsRepository: Repository<PartialComponents>,

    @InjectRepository(PartialGrades)
    private readonly partialGradesRepository: Repository<PartialGrades>,
  ) {}

  private async validatePartialGrade(
    partialGradeId: string,
  ): Promise<PartialGrades> {
    const partialGrade =
      await this.partialGradesRepository.findOne({
        where: {
          id: partialGradeId,
        },
      });

    if (!partialGrade) {
      throw new NotFoundException(
        `No se encontró la calificación parcial con id ${partialGradeId}`,
      );
    }

    return partialGrade;
  }

  private async validatePartialComponent(
    partialComponentId: string,
  ): Promise<PartialComponents> {
    const partialComponent =
      await this.partialComponentsRepository.findOne({
        where: {
          id: partialComponentId,
        },
      });

    if (!partialComponent) {
      throw new NotFoundException(
        `No se encontró el componente parcial con id ${partialComponentId}`,
      );
    }

    return partialComponent;
  }

  private validateScore(score?: string | null): void {
    if (
      score === undefined ||
      score === null
    ) {
      return;
    }

    const numericScore = Number(score);

    if (
      Number.isNaN(numericScore) ||
      numericScore < 0 ||
      numericScore > 100
    ) {
      throw new BadRequestException(
        'La calificación del componente debe estar entre 0 y 100',
      );
    }
  }

  private validateSamePartialConfig(
    partialGrade: PartialGrades,
    partialComponent: PartialComponents,
  ): void {
    if (
      partialGrade.partialConfigId !==
      partialComponent.partialConfigId
    ) {
      throw new BadRequestException(
        'El componente no pertenece a la misma configuración parcial que la calificación',
      );
    }
  }

  private async validateDuplicate(
    partialGradeId: string,
    partialComponentId: string,
    componentScoreId?: string,
  ): Promise<void> {
    const existingScore =
      await this.componentScoresRepository.findOne({
        where: componentScoreId
          ? {
              partialGradeId,
              partialComponentId,
              id: Not(componentScoreId),
            }
          : {
              partialGradeId,
              partialComponentId,
            },
      });

    if (existingScore) {
      throw new ConflictException(
        'Ya existe una calificación para este componente dentro de la calificación parcial',
      );
    }
  }

  private async recalculatePartialGradeTotal(
    partialGradeId: string,
  ): Promise<void> {
    const partialGrade =
      await this.partialGradesRepository.findOne({
        where: {
          id: partialGradeId,
        },
      });

    if (!partialGrade) {
      return;
    }

    const componentScores =
      await this.componentScoresRepository.find({
        where: {
          partialGradeId,
        },
        relations: {
          partialComponent: true,
        },
      });

    const weightedTotal = componentScores.reduce(
      (total, componentScore) => {
        if (
          componentScore.score === null ||
          !componentScore.partialComponent
        ) {
          return total;
        }

        const score = Number(componentScore.score);
        const weight = Number(
          componentScore.partialComponent.weight,
        );

        return total + (score * weight) / 100;
      },
      0,
    );

    const extraPoints = Number(
      partialGrade.extraPoints ?? 0,
    );

    const total = Math.min(
      100,
      weightedTotal + extraPoints,
    );

    partialGrade.total = total.toFixed(2);
    partialGrade.updatedAt = new Date();

    await this.partialGradesRepository.save(
      partialGrade,
    );
  }

  async create(
    createComponentScoreDto: CreateComponentScoreDto,
  ): Promise<ComponentScores> {
    const {
      partialGradeId,
      partialComponentId,
      score,
    } = createComponentScoreDto;

    const partialGrade =
      await this.validatePartialGrade(
        partialGradeId,
      );

    const partialComponent =
      await this.validatePartialComponent(
        partialComponentId,
      );

    this.validateSamePartialConfig(
      partialGrade,
      partialComponent,
    );

    this.validateScore(score);

    await this.validateDuplicate(
      partialGradeId,
      partialComponentId,
    );

    const componentScore =
      this.componentScoresRepository.create({
        partialGradeId,
        partialComponentId,
        score: score ?? null,
      });

    const savedComponentScore =
      await this.componentScoresRepository.save(
        componentScore,
      );

    await this.recalculatePartialGradeTotal(
      partialGradeId,
    );

    return this.findOne(savedComponentScore.id);
  }

  async findAll(): Promise<ComponentScores[]> {
    return this.componentScoresRepository.find({
      relations: {
        partialGrade: {
          student: {
            user: true,
          },
          subject: true,
          partialConfig: true,
        },
        partialComponent: true,
        criterionScores: {
          componentCriterion: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(
    id: string,
  ): Promise<ComponentScores> {
    const componentScore =
      await this.componentScoresRepository.findOne({
        where: {
          id,
        },
        relations: {
          partialGrade: {
            student: {
              user: true,
            },
            subject: true,
            partialConfig: true,
          },
          partialComponent: true,
          criterionScores: {
            componentCriterion: true,
          },
        },
      });

    if (!componentScore) {
      throw new NotFoundException(
        `No se encontró la calificación de componente con id ${id}`,
      );
    }

    return componentScore;
  }

  async update(
    id: string,
    updateComponentScoreDto: UpdateComponentScoreDto,
  ): Promise<ComponentScores> {
    const componentScore = await this.findOne(id);

    const previousPartialGradeId =
      componentScore.partialGradeId;

    const partialGradeId =
      updateComponentScoreDto.partialGradeId ??
      componentScore.partialGradeId;

    const partialComponentId =
      updateComponentScoreDto.partialComponentId ??
      componentScore.partialComponentId;

    const score =
      updateComponentScoreDto.score !== undefined
        ? updateComponentScoreDto.score
        : componentScore.score;

    const partialGrade =
      await this.validatePartialGrade(
        partialGradeId,
      );

    const partialComponent =
      await this.validatePartialComponent(
        partialComponentId,
      );

    this.validateSamePartialConfig(
      partialGrade,
      partialComponent,
    );

    this.validateScore(score);

    await this.validateDuplicate(
      partialGradeId,
      partialComponentId,
      id,
    );

    const updatedComponentScore =
      this.componentScoresRepository.merge(
        componentScore,
        {
          partialGradeId,
          partialComponentId,
          score,
        },
      );

    await this.componentScoresRepository.save(
      updatedComponentScore,
    );

    await this.recalculatePartialGradeTotal(
      partialGradeId,
    );

    if (
      previousPartialGradeId !== partialGradeId
    ) {
      await this.recalculatePartialGradeTotal(
        previousPartialGradeId,
      );
    }

    return this.findOne(id);
  }

  async remove(
    id: string,
  ): Promise<{ message: string }> {
    const componentScore = await this.findOne(id);

    const partialGradeId =
      componentScore.partialGradeId;

    await this.componentScoresRepository.remove(
      componentScore,
    );

    await this.recalculatePartialGradeTotal(
      partialGradeId,
    );

    return {
      message:
        'Calificación del componente eliminada correctamente',
    };
  }
}