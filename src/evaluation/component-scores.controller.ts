import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { ComponentScoresService } from './component-scores.service';

import { CreateComponentScoreDto } from './dto/create-component-score.dto';
import { UpdateComponentScoreDto } from './dto/update-component-score.dto';

@Controller('component-scores')
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
  findOne(@Param('id') id: string) {
    return this.componentScoresService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateComponentScoreDto: UpdateComponentScoreDto,
  ) {
    return this.componentScoresService.update(
      id,
      updateComponentScoreDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.componentScoresService.remove(id);
  }
}