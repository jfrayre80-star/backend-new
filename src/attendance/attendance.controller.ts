import { Body, Controller, Post, Req, UseGuards, Get, Param, Query, Patch, Delete } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { StartAttendanceDto } from './dto/start-attendance.dto';
import { ScanQrDto } from './dto/scan-qr.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles} from '../auth/roles.decorator';
import { CreateJustificationDto } from './dto/create-justification.dto';
import {UpdateJustificationDto} from './dto/update-justification.dto';
import { CreateAccessLogDto } from './dto/create-access-log.dto';
import {ManualAttendanceDto} from './dto/manual-attendance.dto';


@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

//==========================================================================
  //ASISTENCIAS Y QR
//inicio de asistencia por parte del docente
  @Roles('teacher')
  @Post('start')
  start(@Body() dto: StartAttendanceDto) {
    return this.attendanceService.start(dto);
  }
//escaneo de QR por parte del estudiante
  @Roles('student')
  @Post('scan')
  scanQr(@Req() req: any, @Body() dto: ScanQrDto) {
    return this.attendanceService.scanQr(req.user.id, dto);
  }
//cierre de asistencia por parte del docente
  @Roles('teacher')
  @Post('close/:scheduleId')
  closeAttendance(@Param('scheduleId') scheduleId: string, @Req() req: any) {
    return this.attendanceService.closeAttendance(scheduleId, req.user.id);
  }
  //pase de lista manual por parte del docente
@Roles('teacher')
  @Post('manual')
  updateStudentAttendanceManual(@Body() dto: ManualAttendanceDto, @Req() req: any) {
    return this.attendanceService.updateStudentAttendanceManual(dto, req.user.id);
  }
//==========================================================================
  //METRICAS Y LISTAS EN TIEMPO REAL
//obtencion de metricas de asistencia por parte del docente, estudiante, padre o admin
  @Roles('admin', 'teacher', 'student', 'parent')
  @Get('metrics/student/:studentId')
  getStudentMetrics(
    @Param('studentId') studentId: string,
    @Req() req: any,
    @Query('scheduleId') scheduleId?: string,
  ) {
    return this.attendanceService.getStudentMetrics(studentId, req.user, scheduleId);
  }
//reporte de asistencia de la clase en tiempo real para el docente
@Roles('teacher')
  @Get('today/:scheduleId')
  getClassAttendanceToday(@Param('scheduleId') scheduleId: string) {
    return this.attendanceService.getClassAttendanceToday(scheduleId);
  }

//reporte general de porcentajes y métricas acumuladas de todos los alumnos de un grupo
  @Roles('teacher', 'admin')
  @Get('group-rates/:groupId')
  getGroupStudentsWithAttendanceRate(
    @Param('groupId') groupId: string,
    @Query('scheduleId') scheduleId?: string,
  ) {
    return this.attendanceService.getGroupStudentsWithAttendanceRate(groupId, scheduleId);
  }

  //==========================================================================
  //JUSTIFICACIONES
//creacion de justificante por parte del admin
  @Roles('admin')
  @Post('justifications')
  createJustification(@Req() req: any, @Body() dto: CreateJustificationDto) {
    dto.registeredBy = req.user.id;
    return this.attendanceService.createJustification(dto);
  }
//obtencion de todos los justificantes por parte del admin y del docente por filtro de fecha
  @Roles('admin', 'teacher')
  @Get('justifications')
  findAllJustifications(@Query('date') date?: string) {
    return this.attendanceService.findAllJustifications(date);
  }
 //obtencion de justificante por id del alumno
@Roles('admin', 'teacher', 'student', 'parent')
  @Get('justifications/student/:studentId')
  getStudentJustifications(@Param('studentId') studentId: string) {
    return this.attendanceService.findJustificationsByStudentId(studentId);
  }
  //obtencion de justificante por nombre del alumno para el admin y del docente
@Roles('admin', 'teacher')
  @Get('justifications/search/by-student')
  searchJustificationsByStudentName(@Query('name') name: string) {
    return this.attendanceService.findJustificationsByStudentName(name);
  }
  //obtencion de justificante por id para el admin y del docente
@Roles('admin', 'teacher')
  @Get('justifications/:id')
  findJustificationById(@Param('id') id: string) {
    return this.attendanceService.findJustificationById(id);
  }
  //edicion de justificante admin
@Roles('admin')
  @Patch('justifications/:id')
  updateJustification(@Param('id') id: string, @Body() dto: UpdateJustificationDto) {
    return this.attendanceService.updateJustification(id, dto);
  }
  //eliminacion de justificante admin
@Roles('admin')
  @Delete('justifications/:id')
  removeJustification(@Param('id') id: string) {
    return this.attendanceService.removeJustification(id);
  }

//==========================================================================
  //REGISTROS DE ACCESO

@Roles('admin')
  @Post('access-logs')
  createAccessLog(@Body() dto: CreateAccessLogDto) {
    return this.attendanceService.createAccessLog(dto);
  }

  // Endpoint especial para la sincronización offline
  @Roles('admin')
  @Post('access-logs/sync')
  syncSingleAccessLog(@Body() dto: CreateAccessLogDto) {
    return this.attendanceService.syncSingleAccessLog(dto);
  }
//obtencion de registros de acceso por alumno
  @Roles('admin')
  @Get('access-logs/student/:studentId')
  getStudentAccessLogs(@Param('studentId') studentId: string) {
    return this.attendanceService.findAccessLogsByStudent(studentId);
  }
//obtencion de registros de acceso por nombre del alumno
  @Roles('admin')
  @Get('access-logs/search/by-student')
  searchAccessLogsByName(@Query('name') name: string) {
    return this.attendanceService.findAccessLogByStudentName(name);
  }

}
