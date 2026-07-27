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

import { PartialGradesService } from './partial-grades.service';

import { CreatePartialGradeDto } from './dto/create-partial-grade.dto';
import { UpdatePartialGradeDto } from './dto/update-partial-grade.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('partial-grades')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'teacher')
export class PartialGradesController {
  constructor(
    private readonly partialGradesService: PartialGradesService,
  ) {}

  @Get()
  findAll() {
    return this.partialGradesService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.partialGradesService.findOne(id);
  }

  @Post()
  create(
    @Body()
    createPartialGradeDto: CreatePartialGradeDto,
  ) {
    return this.partialGradesService.create(
      createPartialGradeDto,
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    updatePartialGradeDto: UpdatePartialGradeDto,
  ) {
    return this.partialGradesService.update(
      id,
      updatePartialGradeDto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.partialGradesService.remove(id);
  }
}