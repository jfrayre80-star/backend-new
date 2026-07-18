import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { EvaluationSchemesService } from './evaluation-schemes.service';
import { CreateEvaluationSchemeDto } from './dto/create-evaluation-scheme.dto';
import { UpdateEvaluationSchemeDto } from './dto/update-evaluation-scheme.dto';

@Controller('evaluation-schemes')
export class EvaluationSchemesController {
  constructor(
    private readonly evaluationSchemesService: EvaluationSchemesService,
  ) {}

  @Get()
  findAll() {
    return this.evaluationSchemesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.evaluationSchemesService.findOne(id);
  }

  @Post()
  create(
    @Body()
    createEvaluationSchemeDto: CreateEvaluationSchemeDto,
  ) {
    return this.evaluationSchemesService.create(
      createEvaluationSchemeDto,
    );
  }

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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.evaluationSchemesService.remove(id);
  }
}