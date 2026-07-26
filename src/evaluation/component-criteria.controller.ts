import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { ComponentCriteriaService } from './component-criteria.service';

import { CreateComponentCriterionDto } from './dto/create-component-criterion.dto';
import { UpdateComponentCriterionDto } from './dto/update-component-criterion.dto';

@Controller('component-criteria')
export class ComponentCriteriaController {
  constructor(
    private readonly componentCriteriaService: ComponentCriteriaService,
  ) {}

  @Post()
  create(
    @Body()
    createComponentCriterionDto: CreateComponentCriterionDto,
  ) {
    return this.componentCriteriaService.create(
      createComponentCriterionDto,
    );
  }

  @Get()
  findAll() {
    return this.componentCriteriaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.componentCriteriaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateComponentCriterionDto: UpdateComponentCriterionDto,
  ) {
    return this.componentCriteriaService.update(
      id,
      updateComponentCriterionDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.componentCriteriaService.remove(id);
  }
}