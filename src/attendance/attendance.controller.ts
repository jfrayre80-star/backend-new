import { Body, Controller, Post, Req, UseGuards, Get, Param } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { StartAttendanceDto } from './dto/attendance.dto';
import { ScanQrDto } from './dto/scan-qr.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateJustificationDto } from './dto/create-justification.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Roles('teacher', 'admin')
  @Post('start')
  start(@Body() dto: StartAttendanceDto) {
    return this.attendanceService.start(dto);
  }

  @Roles('student')
  @Post('scan')
  scanQr(@Req() req: any, @Body() dto: ScanQrDto) {
    return this.attendanceService.scanQr(req.user.id, dto);
  }

  @Roles('admin')
@Post('justifications')
createJustification(@Req() req: any, @Body() dto: CreateJustificationDto) {
  return this.attendanceService.createJustification(req.user.id, dto);
}

@Roles('admin', 'teacher', 'student')
@Get('justifications/student/:studentId')
getStudentJustifications(@Param('studentId') studentId: string) {
  return this.attendanceService.findJustificationsByStudent(studentId);
}
}