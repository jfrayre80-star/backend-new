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

import { ComponentScoresService } from './component-scores.service';

import { CreateComponentScoreDto } from './dto/create-component-score.dto';
import { UpdateComponentScoreDto } from './dto/update-component-score.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('component-scores')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'teacher')
export class ComponentScoresController {
  constructor(
    private readonly componentScoresService: ComponentScoresService,
  ) {}

  @Post()
  create(
    @Body()
    createComponentScoreDto: CreateComponentScoreDto,
  ) {
    return this.componentScoresService.create(
      createComponentScoreDto,
    );
  }

  @Get()
  findAll() {
    return this.componentScoresService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.componentScoresService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    updateComponentScoreDto: UpdateComponentScoreDto,
  ) {
    return this.componentScoresService.update(
      id,
      updateComponentScoreDto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.componentScoresService.remove(id);
  }
}