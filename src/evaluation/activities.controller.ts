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

import { ActivitiesService } from './activities.service';

import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('activities')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivitiesController {
  constructor(
    private readonly activitiesService: ActivitiesService,
  ) {}

  @Roles('admin', 'teacher', 'student')
  @Get()
  findAll() {
    return this.activitiesService.findAll();
  }

  @Roles('admin', 'teacher', 'student')
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.activitiesService.findOne(id);
  }

  @Roles('admin', 'teacher')
  @Post()
  create(
    @Body() createActivityDto: CreateActivityDto,
  ) {
    return this.activitiesService.create(
      createActivityDto,
    );
  }

  @Roles('admin', 'teacher')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateActivityDto: UpdateActivityDto,
  ) {
    return this.activitiesService.update(
      id,
      updateActivityDto,
    );
  }

  @Roles('admin', 'teacher')
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.activitiesService.remove(id);
  }
}