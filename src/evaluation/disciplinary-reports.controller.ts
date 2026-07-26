import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { DisciplinaryReportsService } from './disciplinary-reports.service';

import { CreateDisciplinaryReportDto } from './dto/create-disciplinary-report.dto';
import { UpdateDisciplinaryReportDto } from './dto/update-disciplinary-report.dto';

@Controller('disciplinary-reports')
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
  findOne(@Param('id') id: string) {
    return this.disciplinaryReportsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateDisciplinaryReportDto: UpdateDisciplinaryReportDto,
  ) {
    return this.disciplinaryReportsService.update(
      id,
      updateDisciplinaryReportDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.disciplinaryReportsService.remove(id);
  }
}