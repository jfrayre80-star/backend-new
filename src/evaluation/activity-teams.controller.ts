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

import { ActivityTeamsService } from './activity-teams.service';

import { CreateActivityTeamDto } from './dto/create-activity-team.dto';
import { UpdateActivityTeamDto } from './dto/update-activity-team.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('activity-teams')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'teacher')
export class ActivityTeamsController {
  constructor(
    private readonly activityTeamsService: ActivityTeamsService,
  ) {}

  @Post()
  create(
    @Body()
    createActivityTeamDto: CreateActivityTeamDto,
  ) {
    return this.activityTeamsService.create(
      createActivityTeamDto,
    );
  }

  @Get()
  findAll() {
    return this.activityTeamsService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.activityTeamsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    updateActivityTeamDto: UpdateActivityTeamDto,
  ) {
    return this.activityTeamsService.update(
      id,
      updateActivityTeamDto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.activityTeamsService.remove(id);
  }
}