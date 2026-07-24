import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { ActivityExceptionsService } from './activity-exceptions.service';

import { CreateActivityExceptionDto } from './dto/create-activity-exception.dto';
import { UpdateActivityExceptionDto } from './dto/update-activity-exception.dto';

@Controller('activity-exceptions')
export class ActivityExceptionsController {
  constructor(
    private readonly activityExceptionsService: ActivityExceptionsService,
  ) {}

  @Post()
  create(
    @Body()
    createActivityExceptionDto: CreateActivityExceptionDto,
  ) {
    return this.activityExceptionsService.create(
      createActivityExceptionDto,
    );
  }

  @Get()
  findAll() {
    return this.activityExceptionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activityExceptionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateActivityExceptionDto: UpdateActivityExceptionDto,
  ) {
    return this.activityExceptionsService.update(
      id,
      updateActivityExceptionDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.activityExceptionsService.remove(id);
  }
}