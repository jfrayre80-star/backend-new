import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { PartialGradesService } from './partial-grades.service';

import { CreatePartialGradeDto } from './dto/create-partial-grade.dto';
import { UpdatePartialGradeDto } from './dto/update-partial-grade.dto';

@Controller('partial-grades')
export class PartialGradesController {
  constructor(
    private readonly partialGradesService: PartialGradesService,
  ) {}

  @Get()
  findAll() {
    return this.partialGradesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.partialGradesService.findOne(id);
  }

  @Post()
  create(
    @Body()
    createPartialGradeDto: CreatePartialGradeDto,
  ) {
    return this.partialGradesService.create(createPartialGradeDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updatePartialGradeDto: UpdatePartialGradeDto,
  ) {
    return this.partialGradesService.update(
      id,
      updatePartialGradeDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.partialGradesService.remove(id);
  }
}