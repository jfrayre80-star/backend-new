import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { CriterionScoresService } from './criterion-scores.service';

import { CreateCriterionScoreDto } from './dto/create-criterion-score.dto';
import { UpdateCriterionScoreDto } from './dto/update-criterion-score.dto';

@Controller('criterion-scores')
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
  findOne(@Param('id') id: string) {
    return this.criterionScoresService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateCriterionScoreDto: UpdateCriterionScoreDto,
  ) {
    return this.criterionScoresService.update(
      id,
      updateCriterionScoreDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.criterionScoresService.remove(id);
  }
}