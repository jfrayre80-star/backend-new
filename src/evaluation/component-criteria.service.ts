import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { ComponentCriteria } from './ComponentCriteria';
import { PartialComponents } from './PartialComponents';

import { CreateComponentCriterionDto } from './dto/create-component-criterion.dto';
import { UpdateComponentCriterionDto } from './dto/update-component-criterion.dto';

@Injectable()
export class ComponentCriteriaService {
  constructor(
    @InjectRepository(ComponentCriteria)
    private readonly componentCriteriaRepository: Repository<ComponentCriteria>,

    @InjectRepository(PartialComponents)
    private readonly partialComponentsRepository: Repository<PartialComponents>,
  ) {}

  private async validatePartialComponent(
    partialComponentId: string,
  ): Promise<void> {
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
  }

  private validateWeight(weight: string): void {
    const numericWeight = Number(weight);

    if (
      Number.isNaN(numericWeight) ||
      numericWeight <= 0 ||
      numericWeight > 100
    ) {
      throw new BadRequestException(
        'El peso debe ser mayor que 0 y menor o igual a 100',
      );
    }
  }

  private async validateWeightSum(
    partialComponentId: string,
    weight: string,
    criterionId?: string,
  ): Promise<void> {
    const criteria =
      await this.componentCriteriaRepository.find({
        where: criterionId
          ? {
              partialComponentId,
              id: Not(criterionId),
            }
          : {
              partialComponentId,
            },
      });

    const currentTotal = criteria.reduce(
      (total, criterion) =>
        total + Number(criterion.weight),
      0,
    );

    const resultingTotal =
      currentTotal + Number(weight);

    if (resultingTotal > 100) {
      throw new BadRequestException(
        `La suma de los pesos de los criterios no puede superar 100. Total resultante: ${resultingTotal}`,
      );
    }
  }

  private async validateDuplicateName(
    partialComponentId: string,
    name: string,
    criterionId?: string,
  ): Promise<void> {
    const normalizedName = name.trim();

    const existingCriterion =
      await this.componentCriteriaRepository
        .createQueryBuilder('criterion')
        .where(
          'criterion.partial_component_id = :partialComponentId',
          {
            partialComponentId,
          },
        )
        .andWhere(
          'LOWER(TRIM(criterion.name)) = LOWER(TRIM(:name))',
          {
            name: normalizedName,
          },
        )
        .andWhere(
          criterionId
            ? 'criterion.id != :criterionId'
            : '1 = 1',
          criterionId
            ? {
                criterionId,
              }
            : {},
        )
        .getOne();

    if (existingCriterion) {
      throw new ConflictException(
        `Ya existe un criterio llamado "${normalizedName}" dentro de este componente`,
      );
    }
  }

  private async validateDuplicateSortOrder(
    partialComponentId: string,
    sortOrder: number,
    criterionId?: string,
  ): Promise<void> {
    const existingCriterion =
      await this.componentCriteriaRepository.findOne({
        where: criterionId
          ? {
              partialComponentId,
              sortOrder,
              id: Not(criterionId),
            }
          : {
              partialComponentId,
              sortOrder,
            },
      });

    if (existingCriterion) {
      throw new ConflictException(
        `Ya existe un criterio con el orden ${sortOrder} dentro de este componente`,
      );
    }
  }

  async create(
    createComponentCriterionDto: CreateComponentCriterionDto,
  ): Promise<ComponentCriteria> {
    const {
      partialComponentId,
      name,
      weight,
      sortOrder,
    } = createComponentCriterionDto;

    await this.validatePartialComponent(
      partialComponentId,
    );

    this.validateWeight(weight);

    await this.validateWeightSum(
      partialComponentId,
      weight,
    );

    await this.validateDuplicateName(
      partialComponentId,
      name,
    );

    await this.validateDuplicateSortOrder(
      partialComponentId,
      sortOrder,
    );

    const criterion =
      this.componentCriteriaRepository.create({
        partialComponentId,
        name: name.trim(),
        weight,
        sortOrder,
      });

    const savedCriterion =
      await this.componentCriteriaRepository.save(
        criterion,
      );

    return this.findOne(savedCriterion.id);
  }

  async findAll(): Promise<ComponentCriteria[]> {
    return this.componentCriteriaRepository.find({
      relations: {
        partialComponent: true,
        criterionScores: true,
      },
      order: {
        partialComponentId: 'ASC',
        sortOrder: 'ASC',
      },
    });
  }

  async findOne(
    id: string,
  ): Promise<ComponentCriteria> {
    const criterion =
      await this.componentCriteriaRepository.findOne({
        where: {
          id,
        },
        relations: {
          partialComponent: true,
          criterionScores: true,
        },
      });

    if (!criterion) {
      throw new NotFoundException(
        `No se encontró el criterio con id ${id}`,
      );
    }

    return criterion;
  }

  async update(
    id: string,
    updateComponentCriterionDto: UpdateComponentCriterionDto,
  ): Promise<ComponentCriteria> {
    const criterion = await this.findOne(id);

    const partialComponentId =
      updateComponentCriterionDto.partialComponentId ??
      criterion.partialComponentId;

    const name =
      updateComponentCriterionDto.name ??
      criterion.name;

    const weight =
      updateComponentCriterionDto.weight ??
      criterion.weight;

    const sortOrder =
      updateComponentCriterionDto.sortOrder ??
      criterion.sortOrder;

    await this.validatePartialComponent(
      partialComponentId,
    );

    this.validateWeight(weight);

    await this.validateWeightSum(
      partialComponentId,
      weight,
      id,
    );

    await this.validateDuplicateName(
      partialComponentId,
      name,
      id,
    );

    await this.validateDuplicateSortOrder(
      partialComponentId,
      sortOrder,
      id,
    );

    const updatedCriterion =
      this.componentCriteriaRepository.merge(
        criterion,
        {
          ...updateComponentCriterionDto,
          partialComponentId,
          name: name.trim(),
          weight,
          sortOrder,
        },
      );

    await this.componentCriteriaRepository.save(
      updatedCriterion,
    );

    return this.findOne(id);
  }

  async remove(
    id: string,
  ): Promise<{ message: string }> {
    const criterion = await this.findOne(id);

    await this.componentCriteriaRepository.remove(
      criterion,
    );

    return {
      message:
        'Criterio del componente eliminado correctamente',
    };
  }
}