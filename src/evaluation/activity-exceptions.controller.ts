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

import { ActivityExceptionsService } from './activity-exceptions.service';

import { CreateActivityExceptionDto } from './dto/create-activity-exception.dto';
import { UpdateActivityExceptionDto } from './dto/update-activity-exception.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('activity-exceptions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'teacher')
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
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.activityExceptionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    updateActivityExceptionDto: UpdateActivityExceptionDto,
  ) {
    return this.activityExceptionsService.update(
      id,
      updateActivityExceptionDto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.activityExceptionsService.remove(id);
  }
}