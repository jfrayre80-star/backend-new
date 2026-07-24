import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { ActivityDeliveriesService } from './activity-deliveries.service';

import { CreateActivityDeliveryDto } from './dto/create-activity-delivery.dto';
import { UpdateActivityDeliveryDto } from './dto/update-activity-delivery.dto';

@Controller('activity-deliveries')
export class ActivityDeliveriesController {
  constructor(
    private readonly activityDeliveriesService: ActivityDeliveriesService,
  ) {}

  @Post()
  create(
    @Body()
    createActivityDeliveryDto: CreateActivityDeliveryDto,
  ) {
    return this.activityDeliveriesService.create(
      createActivityDeliveryDto,
    );
  }

  @Get()
  findAll() {
    return this.activityDeliveriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activityDeliveriesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateActivityDeliveryDto: UpdateActivityDeliveryDto,
  ) {
    return this.activityDeliveriesService.update(
      id,
      updateActivityDeliveryDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.activityDeliveriesService.remove(id);
  }
}