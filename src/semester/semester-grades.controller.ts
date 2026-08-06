import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { SemesterGradesService } from './semester-grades.service';
import { CreateSemesterGradeDto } from './dto/create-semester-grade.dto';
import { UpdateSemesterGradeDto } from './dto/update-semester-grade.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('semester-grades')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class SemesterGradesController {
  constructor(private readonly semesterGradesService: SemesterGradesService) {}

  // GET /semester-grades → retorna todas las calificaciones semestrales
  @Get()
  findAll() {
    return this.semesterGradesService.findAll();
  }

  // GET /semester-grades/:id → retorna una calificación por ID
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.semesterGradesService.findOne(id);
  }

  // POST /semester-grades → crea una calificación semestral manualmente
  @Post()
  create(@Body() dto: CreateSemesterGradeDto) {
    return this.semesterGradesService.create(dto);
  }

  // POST /semester-grades/calculate?studentId=X&subjectId=Y&semesterConfigId=Z
  // Calcula la nota semestral promediando los 3 parciales
  @Post('calculate')
  calculate(
    @Query('studentId', ParseUUIDPipe) studentId: string,
    @Query('subjectId', ParseUUIDPipe) subjectId: string,
    @Query('semesterConfigId', ParseUUIDPipe) semesterConfigId: string,
  ) {
    return this.semesterGradesService.calculate(studentId, subjectId, semesterConfigId);
  }

  // PUT /semester-grades/:id → actualiza una calificación
  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSemesterGradeDto) {
    return this.semesterGradesService.update(id, dto);
  }

  // DELETE /semester-grades/:id → elimina una calificación
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.semesterGradesService.remove(id);
  }
}
