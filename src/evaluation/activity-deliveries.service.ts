import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { ActivityDeliveries } from './ActivityDeliveries';
import { Activities } from './Activities';

import { CreateActivityDeliveryDto } from './dto/create-activity-delivery.dto';
import { UpdateActivityDeliveryDto } from './dto/update-activity-delivery.dto';

@Injectable()
export class ActivityDeliveriesService {
  constructor(
    @InjectRepository(ActivityDeliveries)
    private readonly activityDeliveriesRepository: Repository<ActivityDeliveries>,

    @InjectRepository(Activities)
    private readonly activitiesRepository: Repository<Activities>,
  ) {}

  private async validateActivity(
  activityId: string,
): Promise<Activities> {
  const activity = await this.activitiesRepository.findOne({
    where: { id: activityId },
  });

  if (!activity) {
    throw new NotFoundException(
      `Activity con id ${activityId} no encontrada`,
    );
  }

  return activity;
}

private async validateDuplicateSortOrder(
  activityId: string,
  sortOrder: number,
  excludeId?: string,
) {
  const delivery =
    await this.activityDeliveriesRepository.findOne({
      where: excludeId
        ? {
            activityId,
            sortOrder,
            id: Not(excludeId),
          }
        : {
            activityId,
            sortOrder,
          },
    });

  if (delivery) {
    throw new ConflictException(
      `Ya existe una entrega con el orden ${sortOrder}`,
    );
  }
}

async create(
  createActivityDeliveryDto: CreateActivityDeliveryDto,
) {
  const {
    activityId,
    sortOrder,
  } = createActivityDeliveryDto;

  await this.validateActivity(activityId);

  await this.validateDuplicateSortOrder(
    activityId,
    sortOrder,
  );

  const delivery = this.activityDeliveriesRepository.create(
    createActivityDeliveryDto,
  );

  return await this.activityDeliveriesRepository.save(
    delivery,
  );
}

async findAll() {
  return await this.activityDeliveriesRepository.find({
    relations: {
      activity: true,
      submissions: true,
    },
    order: {
      sortOrder: 'ASC',
    },
  });
}

async findOne(id: string) {
  const delivery =
    await this.activityDeliveriesRepository.findOne({
      where: { id },
      relations: {
        activity: true,
        submissions: true,
      },
    });

  if (!delivery) {
    throw new NotFoundException(
      `Activity Delivery con id ${id} no encontrada`,
    );
  }

  return delivery;
}

async update(
  id: string,
  updateActivityDeliveryDto: UpdateActivityDeliveryDto,
) {
  const delivery = await this.findOne(id);

  const activityId =
    updateActivityDeliveryDto.activityId ??
    delivery.activityId;

  const sortOrder =
    updateActivityDeliveryDto.sortOrder ??
    delivery.sortOrder;

  if (
    updateActivityDeliveryDto.activityId &&
    updateActivityDeliveryDto.activityId !==
      delivery.activityId
  ) {
    await this.validateActivity(activityId);
  }

  await this.validateDuplicateSortOrder(
    activityId,
    sortOrder,
    id,
  );

  Object.assign(
    delivery,
    updateActivityDeliveryDto,
  );

  return await this.activityDeliveriesRepository.save(
    delivery,
  );
}

async remove(id: string) {
  const delivery = await this.findOne(id);

  await this.activityDeliveriesRepository.remove(
    delivery,
  );

  return {
    message:
      'Activity Delivery eliminada correctamente',
  };
}

  }