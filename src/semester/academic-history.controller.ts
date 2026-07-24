import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { AcademicHistoryService } from './academic-history.service';
import { CreateAcademicHistoryDto } from './dto/create-academic-history.dto';
import { UpdateAcademicHistoryDto } from './dto/update-academic-history.dto';

@Controller('academic-history')
export class AcademicHistoryController {
  constructor(private readonly academicHistoryService: AcademicHistoryService) {}

  // GET /academic-history → retorna todo el historial
  @Get()
  findAll() {
    return this.academicHistoryService.findAll();
  }

  // GET /academic-history/:id → retorna un registro por ID
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.academicHistoryService.findOne(id);
  }

  // GET /academic-history/student/:studentId → historial completo de un alumno
  @Get('student/:studentId')
  findByStudent(@Param('studentId', ParseUUIDPipe) studentId: string) {
    return this.academicHistoryService.findByStudent(studentId);
  }

  // POST /academic-history → crea un registro manual
  @Post()
  create(@Body() dto: CreateAcademicHistoryDto) {
    return this.academicHistoryService.create(dto);
  }

  // POST /academic-history/close-semester?studentId=X&subjectId=Y&semesterId=Z
  // Cierra el semestre: calcula finalGrade y isApproved
  @Post('close-semester')
  closeSemester(
    @Query('studentId', ParseUUIDPipe) studentId: string,
    @Query('subjectId', ParseUUIDPipe) subjectId: string,
    @Query('semesterId', ParseUUIDPipe) semesterId: string,
  ) {
    return this.academicHistoryService.closeSemester(studentId, subjectId, semesterId);
  }

  // PUT /academic-history/:id → actualiza un registro
  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAcademicHistoryDto) {
    return this.academicHistoryService.update(id, dto);
  }

  // DELETE /academic-history/:id → elimina un registro
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.academicHistoryService.remove(id);
  }
}
