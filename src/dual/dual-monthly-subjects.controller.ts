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

import { DualMonthlySubjectsService } from './dual-monthly-subjects.service';
import { CreateDualMonthlySubjectDto } from './dto/create-dual-monthly-subject.dto';
import { UpdateDualMonthlySubjectDto } from './dto/update-dual-monthly-subject.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('dual-monthly-subjects')
export class DualMonthlySubjectsController {
  constructor(
    private readonly dualMonthlySubjectsService: DualMonthlySubjectsService,
  ) {}

  // Lista todas las materias mensuales duales (lectura pública).
  @Get()
  findAll() {
    return this.dualMonthlySubjectsService.findAll();
  }

  // Obtiene las materias mensuales de una inscripción dual concreta.
  @Get('enrollment/:dualEnrollmentId')
  findByEnrollment(@Param('dualEnrollmentId') dualEnrollmentId: string) {
    return this.dualMonthlySubjectsService.findByEnrollment(
      dualEnrollmentId,
    );
  }

  // Obtiene una materia mensual dual por su id.
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dualMonthlySubjectsService.findOne(id);
  }

  // Crea una materia mensual dual (solo administradores).
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateDualMonthlySubjectDto) {
    return this.dualMonthlySubjectsService.create(dto);
  }

  // Actualiza una materia mensual dual (solo administradores).
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDualMonthlySubjectDto,
  ) {
    return this.dualMonthlySubjectsService.update(id, dto);
  }

  // Elimina una materia mensual dual (solo administradores).
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dualMonthlySubjectsService.remove(id);
  }
}
