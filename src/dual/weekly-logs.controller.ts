import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { WeeklyLogsService } from './weekly-logs.service';
import { CreateWeeklyLogDto, GradeWeeklyLogDto } from './dto/create-weekly-log.dto';
import { UpdateWeeklyLogDto } from './dto/update-weekly-log.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('weekly-logs')
export class WeeklyLogsController {
  constructor(private readonly weeklyLogsService: WeeklyLogsService) {}

  // Lista todas las bitácoras semanales (lectura pública).
  @Get()
  findAll() {
    return this.weeklyLogsService.findAll();
  }

  // Obtiene las bitácoras de un alumno, opcionalmente filtradas por materia.
  @Get('student/:studentId')
  findByStudent(
    @Param('studentId') studentId: string,
    @Query('subjectId') subjectId?: string,
  ) {
    return this.weeklyLogsService.findByStudent(studentId, subjectId);
  }

  // Obtiene una bitácora por su id.
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.weeklyLogsService.findOne(id);
  }

  // Crea una bitácora (alumno DUAL, tutor o administrador).
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'teacher', 'student')
  @Post()
  create(@Body() dto: CreateWeeklyLogDto) {
    return this.weeklyLogsService.create(dto);
  }

  // Califica o retroalimenta una bitácora (tutor de empresa o académico).
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  @Patch(':id/grade')
  grade(@Param('id') id: string, @Body() dto: GradeWeeklyLogDto) {
    return this.weeklyLogsService.grade(id, dto);
  }

  // Actualiza una bitácora (solo administradores o el propio alumno).
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'student')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWeeklyLogDto) {
    return this.weeklyLogsService.update(id, dto);
  }

  // Elimina una bitácora (solo administradores).
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.weeklyLogsService.remove(id);
  }
}
