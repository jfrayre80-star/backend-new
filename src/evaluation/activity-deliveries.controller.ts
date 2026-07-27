import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ActivityDeliveriesService } from './activity-deliveries.service';

import { CreateActivityDeliveryDto } from './dto/create-activity-delivery.dto';
import { UpdateActivityDeliveryDto } from './dto/update-activity-delivery.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('activity-deliveries')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'teacher')
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
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.activityDeliveriesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    updateActivityDeliveryDto: UpdateActivityDeliveryDto,
  ) {
    return this.activityDeliveriesService.update(
      id,
      updateActivityDeliveryDto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.activityDeliveriesService.remove(id);
  }
}