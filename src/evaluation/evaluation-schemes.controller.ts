import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { EvaluationSchemesService } from './evaluation-schemes.service';
import { CreateEvaluationSchemeDto } from './dto/create-evaluation-scheme.dto';
import { UpdateEvaluationSchemeDto } from './dto/update-evaluation-scheme.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('evaluation-schemes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EvaluationSchemesController {
  constructor(
    private readonly evaluationSchemesService: EvaluationSchemesService,
  ) {}

  @Roles('admin', 'teacher')
  @Get()
  findAll() {
    return this.evaluationSchemesService.findAll();
  }

  @Roles('admin', 'teacher')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.evaluationSchemesService.findOne(id);
  }

  @Roles('admin', 'teacher')
  @Post()
  create(
    @Body()
    createEvaluationSchemeDto: CreateEvaluationSchemeDto,
  ) {
    return this.evaluationSchemesService.create(
      createEvaluationSchemeDto,
    );
  }

  @Roles('admin', 'teacher')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateEvaluationSchemeDto: UpdateEvaluationSchemeDto,
  ) {
    return this.evaluationSchemesService.update(
      id,
      updateEvaluationSchemeDto,
    );
  }

  @Roles('admin', 'teacher')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.evaluationSchemesService.remove(id);
  }
}