import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { ActivityTeamsService } from './activity-teams.service';

import { CreateActivityTeamDto } from './dto/create-activity-team.dto';
import { UpdateActivityTeamDto } from './dto/update-activity-team.dto';

@Controller('activity-teams')
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
  findOne(@Param('id') id: string) {
    return this.activityTeamsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateActivityTeamDto: UpdateActivityTeamDto,
  ) {
    return this.activityTeamsService.update(
      id,
      updateActivityTeamDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.activityTeamsService.remove(id);
  }
}