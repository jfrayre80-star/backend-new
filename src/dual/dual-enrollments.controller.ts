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

import { DualEnrollmentsService } from './dual-enrollments.service';
import { CreateDualEnrollmentDto } from './dto/create-dual-enrollment.dto';
import { UpdateDualEnrollmentDto } from './dto/update-dual-enrollment.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('dual-enrollments')
export class DualEnrollmentsController {
  constructor(
    private readonly dualEnrollmentsService: DualEnrollmentsService,
  ) {}

  // Lista todas las inscripciones duales (lectura pública).
  @Get()
  findAll() {
    return this.dualEnrollmentsService.findAll();
  }

  // Obtiene las inscripciones de un alumno concreto.
  @Get('student/:studentId')
  findByStudent(@Param('studentId') studentId: string) {
    return this.dualEnrollmentsService.findByStudent(studentId);
  }

  // Obtiene una inscripción dual por su id.
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dualEnrollmentsService.findOne(id);
  }

  // Crea una inscripción dual (solo administradores).
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateDualEnrollmentDto) {
    return this.dualEnrollmentsService.create(dto);
  }

  // Actualiza una inscripción dual (solo administradores).
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDualEnrollmentDto,
  ) {
    return this.dualEnrollmentsService.update(id, dto);
  }

  // Elimina una inscripción dual (solo administradores).
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dualEnrollmentsService.remove(id);
  }
}
