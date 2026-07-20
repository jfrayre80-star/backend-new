import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { PartialComponents } from './PartialComponents';
import { PartialConfigs } from './PartialConfigs';

import { CreatePartialComponentDto } from './dto/create-partial-component.dto';
import { UpdatePartialComponentDto } from './dto/update-partial-component.dto';

@Injectable()
export class PartialComponentsService {
  constructor(
    @InjectRepository(PartialComponents)
    private readonly partialComponentsRepository: Repository<PartialComponents>,

    @InjectRepository(PartialConfigs)
    private readonly partialConfigsRepository: Repository<PartialConfigs>,
  ) {}

  private async validatePartialConfig(
    partialConfigId: string,
  ): Promise<PartialConfigs> {
    const partialConfig = await this.partialConfigsRepository.findOne({
      where: { id: partialConfigId },
    });

    if (!partialConfig) {
      throw new NotFoundException(
        `Partial Config con id ${partialConfigId} no encontrado`,
      );
    }

    return partialConfig;
  }

  private async validateWeightSum(
    partialConfigId: string,
    weight: string,
    excludeId?: string,
  ): Promise<void> {
    const components = await this.partialComponentsRepository.find({
      where: excludeId
        ? {
            partialConfigId,
            id: Not(excludeId),
          }
        : {
            partialConfigId,
          },
    });

    const currentWeight = components.reduce(
      (sum, component) => sum + Number(component.weight),
      0,
    );

    const total = currentWeight + Number(weight);

    if (total > 100) {
      throw new BadRequestException(
        `La suma de los componentes (${total}%) supera el 100% permitido`,
      );
    }
  }

  private async validateDuplicateSortOrder(
    partialConfigId: string,
    sortOrder: number,
    excludeId?: string,
  ): Promise<void> {
    const component = await this.partialComponentsRepository.findOne({
      where: excludeId
        ? {
            partialConfigId,
            sortOrder,
            id: Not(excludeId),
          }
        : {
            partialConfigId,
            sortOrder,
          },
    });

    if (component) {
      throw new ConflictException(
        `Ya existe un componente con el orden ${sortOrder}`,
      );
    }
  }

  private async validateDuplicateName(
    partialConfigId: string,
    name: string,
    excludeId?: string,
  ): Promise<void> {
    const component = await this.partialComponentsRepository.findOne({
      where: excludeId
        ? {
            partialConfigId,
            name,
            id: Not(excludeId),
          }
        : {
            partialConfigId,
            name,
          },
    });

    if (component) {
      throw new ConflictException(
        `Ya existe un componente llamado "${name}"`,
      );
    }
  }

  async create(
    createPartialComponentDto: CreatePartialComponentDto,
  ) {
    const {
      partialConfigId,
      name,
      weight,
      sortOrder,
    } = createPartialComponentDto;

    await this.validatePartialConfig(partialConfigId);

    await this.validateDuplicateName(
      partialConfigId,
      name,
    );

    await this.validateDuplicateSortOrder(
      partialConfigId,
      sortOrder,
    );

    await this.validateWeightSum(
      partialConfigId,
      weight,
    );

    const component = this.partialComponentsRepository.create(
      createPartialComponentDto,
    );

    return await this.partialComponentsRepository.save(component);
  }

  async findAll() {
    return await this.partialComponentsRepository.find({
      relations: {
        partialConfig: true,
        activities: true,
        componentCriteria: true,
        componentScores: true,
      },
      order: {
        sortOrder: 'ASC',
      },
    });
  }

  async findOne(id: string) {
    const component =
      await this.partialComponentsRepository.findOne({
        where: { id },
        relations: {
          partialConfig: true,
          activities: true,
          componentCriteria: true,
          componentScores: true,
        },
      });

    if (!component) {
      throw new NotFoundException(
        `Partial Component con id ${id} no encontrado`,
      );
    }

    return component;
  }

  async update(
    id: string,
    updatePartialComponentDto: UpdatePartialComponentDto,
  ) {
    const component = await this.findOne(id);

    const partialConfigId =
      updatePartialComponentDto.partialConfigId ??
      component.partialConfigId;

    const name =
      updatePartialComponentDto.name ??
      component.name;

    const weight =
      updatePartialComponentDto.weight ??
      component.weight;

    const sortOrder =
      updatePartialComponentDto.sortOrder ??
      component.sortOrder;

    // Si cambia de PartialConfig validar que exista
    if (
      updatePartialComponentDto.partialConfigId &&
      updatePartialComponentDto.partialConfigId !==
        component.partialConfigId
    ) {
      await this.validatePartialConfig(partialConfigId);
    }

    // Sólo validar nombre si cambió
    if (
      name !== component.name ||
      partialConfigId !== component.partialConfigId
    ) {
      await this.validateDuplicateName(
        partialConfigId,
        name,
        id,
      );
    }

    // Sólo validar orden si cambió
    if (
      sortOrder !== component.sortOrder ||
      partialConfigId !== component.partialConfigId
    ) {
      await this.validateDuplicateSortOrder(
        partialConfigId,
        sortOrder,
        id,
      );
    }

    // Sólo validar pesos si cambió
    if (
      weight !== component.weight ||
      partialConfigId !== component.partialConfigId
    ) {
      await this.validateWeightSum(
        partialConfigId,
        weight,
        id,
      );
    }

    Object.assign(component, updatePartialComponentDto);

    return await this.partialComponentsRepository.save(
      component,
    );
  }

  async remove(id: string) {
    const component = await this.findOne(id);

    await this.partialComponentsRepository.remove(
      component,
    );

    return {
      message: 'Partial Component eliminado correctamente',
    };
  }
}