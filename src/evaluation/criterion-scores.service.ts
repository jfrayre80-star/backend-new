import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { CriterionScores } from './CriterionScores';
import { ComponentScores } from './ComponentScores';
import { ComponentCriteria } from './ComponentCriteria';
import { PartialGrades } from './PartialGrades';

import { CreateCriterionScoreDto } from './dto/create-criterion-score.dto';
import { UpdateCriterionScoreDto } from './dto/update-criterion-score.dto';

@Injectable()
export class CriterionScoresService {
  constructor(
    @InjectRepository(CriterionScores)
    private readonly criterionScoresRepository: Repository<CriterionScores>,

    @InjectRepository(ComponentScores)
    private readonly componentScoresRepository: Repository<ComponentScores>,

    @InjectRepository(ComponentCriteria)
    private readonly componentCriteriaRepository: Repository<ComponentCriteria>,

    @InjectRepository(PartialGrades)
    private readonly partialGradesRepository: Repository<PartialGrades>,
  ) {}

  private async validateComponentScore(
    componentScoreId: string,
  ): Promise<ComponentScores> {
    const componentScore =
      await this.componentScoresRepository.findOne({
        where: {
          id: componentScoreId,
        },
        relations: {
          partialComponent: true,
          partialGrade: true,
        },
      });

    if (!componentScore) {
      throw new NotFoundException(
        `No se encontró la calificación de componente con id ${componentScoreId}`,
      );
    }

    return componentScore;
  }

  private async validateComponentCriterion(
    componentCriterionId: string,
  ): Promise<ComponentCriteria> {
    const componentCriterion =
      await this.componentCriteriaRepository.findOne({
        where: {
          id: componentCriterionId,
        },
        relations: {
          partialComponent: true,
        },
      });

    if (!componentCriterion) {
      throw new NotFoundException(
        `No se encontró el criterio con id ${componentCriterionId}`,
      );
    }

    return componentCriterion;
  }

  private validateScore(score?: string | null): void {
    if (score === undefined || score === null) {
      return;
    }

    const numericScore = Number(score);

    if (
      Number.isNaN(numericScore) ||
      numericScore < 0 ||
      numericScore > 100
    ) {
      throw new BadRequestException(
        'La calificación del criterio debe estar entre 0 y 100',
      );
    }
  }

  private validateSameComponent(
    componentScore: ComponentScores,
    componentCriterion: ComponentCriteria,
  ): void {
    if (
      componentScore.partialComponentId !==
      componentCriterion.partialComponentId
    ) {
      throw new BadRequestException(
        'El criterio no pertenece al mismo componente que la calificación',
      );
    }
  }

  private async validateDuplicate(
    componentScoreId: string,
    componentCriterionId: string,
    criterionScoreId?: string,
  ): Promise<void> {
    const existingCriterionScore =
      await this.criterionScoresRepository.findOne({
        where: criterionScoreId
          ? {
              componentScoreId,
              componentCriterionId,
              id: Not(criterionScoreId),
            }
          : {
              componentScoreId,
              componentCriterionId,
            },
      });

    if (existingCriterionScore) {
      throw new ConflictException(
        'Ya existe una calificación para este criterio dentro del componente',
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

    const finalTotal = Math.min(
      100,
      weightedTotal + extraPoints,
    );

    partialGrade.total = finalTotal.toFixed(2);
    partialGrade.updatedAt = new Date();

    await this.partialGradesRepository.save(
      partialGrade,
    );
  }

  private async recalculateComponentScore(
    componentScoreId: string,
  ): Promise<void> {
    const componentScore =
      await this.componentScoresRepository.findOne({
        where: {
          id: componentScoreId,
        },
      });

    if (!componentScore) {
      return;
    }

    const criterionScores =
      await this.criterionScoresRepository.find({
        where: {
          componentScoreId,
        },
        relations: {
          componentCriterion: true,
        },
      });

    const calculatedScore = criterionScores.reduce(
      (total, criterionScore) => {
        if (
          criterionScore.score === null ||
          !criterionScore.componentCriterion
        ) {
          return total;
        }

        const score = Number(criterionScore.score);
        const weight = Number(
          criterionScore.componentCriterion.weight,
        );

        return total + (score * weight) / 100;
      },
      0,
    );

    componentScore.score = calculatedScore.toFixed(2);

    await this.componentScoresRepository.save(
      componentScore,
    );

    await this.recalculatePartialGradeTotal(
      componentScore.partialGradeId,
    );
  }

  async create(
    createCriterionScoreDto: CreateCriterionScoreDto,
  ): Promise<CriterionScores> {
    const {
      componentScoreId,
      componentCriterionId,
      score,
    } = createCriterionScoreDto;

    const componentScore =
      await this.validateComponentScore(
        componentScoreId,
      );

    const componentCriterion =
      await this.validateComponentCriterion(
        componentCriterionId,
      );

    this.validateSameComponent(
      componentScore,
      componentCriterion,
    );

    this.validateScore(score);

    await this.validateDuplicate(
      componentScoreId,
      componentCriterionId,
    );

    const criterionScore =
      this.criterionScoresRepository.create({
        componentScoreId,
        componentCriterionId,
        score: score ?? null,
      });

    const savedCriterionScore =
      await this.criterionScoresRepository.save(
        criterionScore,
      );

    await this.recalculateComponentScore(
      componentScoreId,
    );

    return this.findOne(savedCriterionScore.id);
  }

  async findAll(): Promise<CriterionScores[]> {
    return this.criterionScoresRepository.find({
      relations: {
        componentCriterion: {
          partialComponent: true,
        },
        componentScore: {
          partialComponent: true,
          partialGrade: {
            student: {
              user: true,
            },
            subject: true,
            partialConfig: true,
          },
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(
    id: string,
  ): Promise<CriterionScores> {
    const criterionScore =
      await this.criterionScoresRepository.findOne({
        where: {
          id,
        },
        relations: {
          componentCriterion: {
            partialComponent: true,
          },
          componentScore: {
            partialComponent: true,
            partialGrade: {
              student: {
                user: true,
              },
              subject: true,
              partialConfig: true,
            },
          },
        },
      });

    if (!criterionScore) {
      throw new NotFoundException(
        `No se encontró la calificación de criterio con id ${id}`,
      );
    }

    return criterionScore;
  }

  async update(
    id: string,
    updateCriterionScoreDto: UpdateCriterionScoreDto,
  ): Promise<CriterionScores> {
    const criterionScore = await this.findOne(id);

    const previousComponentScoreId =
      criterionScore.componentScoreId;

    const componentScoreId =
      updateCriterionScoreDto.componentScoreId ??
      criterionScore.componentScoreId;

    const componentCriterionId =
      updateCriterionScoreDto.componentCriterionId ??
      criterionScore.componentCriterionId;

    const score =
      updateCriterionScoreDto.score !== undefined
        ? updateCriterionScoreDto.score
        : criterionScore.score;

    const componentScore =
      await this.validateComponentScore(
        componentScoreId,
      );

    const componentCriterion =
      await this.validateComponentCriterion(
        componentCriterionId,
      );

    this.validateSameComponent(
      componentScore,
      componentCriterion,
    );

    this.validateScore(score);

    await this.validateDuplicate(
      componentScoreId,
      componentCriterionId,
      id,
    );

    const updatedCriterionScore =
      this.criterionScoresRepository.merge(
        criterionScore,
        {
          componentScoreId,
          componentCriterionId,
          score,
        },
      );

    await this.criterionScoresRepository.save(
      updatedCriterionScore,
    );

    await this.recalculateComponentScore(
      componentScoreId,
    );

    if (
      previousComponentScoreId !== componentScoreId
    ) {
      await this.recalculateComponentScore(
        previousComponentScoreId,
      );
    }

    return this.findOne(id);
  }

  async remove(
    id: string,
  ): Promise<{ message: string }> {
    const criterionScore = await this.findOne(id);

    const componentScoreId =
      criterionScore.componentScoreId;

    await this.criterionScoresRepository.remove(
      criterionScore,
    );

    await this.recalculateComponentScore(
      componentScoreId,
    );

    return {
      message:
        'Calificación del criterio eliminada correctamente',
    };
  }
}