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

import { DisciplinaryReportsService } from './disciplinary-reports.service';

import { CreateDisciplinaryReportDto } from './dto/create-disciplinary-report.dto';
import { UpdateDisciplinaryReportDto } from './dto/update-disciplinary-report.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('disciplinary-reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'teacher')
export class DisciplinaryReportsController {
  constructor(
    private readonly disciplinaryReportsService: DisciplinaryReportsService,
  ) {}

  @Post()
  create(
    @Body()
    createDisciplinaryReportDto: CreateDisciplinaryReportDto,
  ) {
    return this.disciplinaryReportsService.create(
      createDisciplinaryReportDto,
    );
  }

  @Get()
  findAll() {
    return this.disciplinaryReportsService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.disciplinaryReportsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    updateDisciplinaryReportDto: UpdateDisciplinaryReportDto,
  ) {
    return this.disciplinaryReportsService.update(
      id,
      updateDisciplinaryReportDto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.disciplinaryReportsService.remove(id);
  }
}