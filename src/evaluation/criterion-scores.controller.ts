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

import { CriterionScoresService } from './criterion-scores.service';

import { CreateCriterionScoreDto } from './dto/create-criterion-score.dto';
import { UpdateCriterionScoreDto } from './dto/update-criterion-score.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('criterion-scores')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'teacher')
export class CriterionScoresController {
  constructor(
    private readonly criterionScoresService: CriterionScoresService,
  ) {}

  @Post()
  create(
    @Body()
    createCriterionScoreDto: CreateCriterionScoreDto,
  ) {
    return this.criterionScoresService.create(
      createCriterionScoreDto,
    );
  }

  @Get()
  findAll() {
    return this.criterionScoresService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.criterionScoresService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    updateCriterionScoreDto: UpdateCriterionScoreDto,
  ) {
    return this.criterionScoresService.update(
      id,
      updateCriterionScoreDto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.criterionScoresService.remove(id);
  }
}