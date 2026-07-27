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

import { ComponentCriteriaService } from './component-criteria.service';

import { CreateComponentCriterionDto } from './dto/create-component-criterion.dto';
import { UpdateComponentCriterionDto } from './dto/update-component-criterion.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('component-criteria')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'teacher')
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
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.componentCriteriaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    updateComponentCriterionDto: UpdateComponentCriterionDto,
  ) {
    return this.componentCriteriaService.update(
      id,
      updateComponentCriterionDto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.componentCriteriaService.remove(id);
  }
}