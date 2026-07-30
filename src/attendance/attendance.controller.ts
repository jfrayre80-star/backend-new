import { Body, Controller, Post, Req, UseGuards, Get, Param, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { StartAttendanceDto } from './dto/start-attendance.dto';
import { ScanQrDto } from './dto/scan-qr.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles} from '../auth/roles.decorator';
import { CreateJustificationDto } from './dto/create-justification.dto';
import { CreateAccessLogDto } from './dto/create-access-log.dto';

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
  return this.attendanceService.createJustification(dto);

}

@Roles('admin', 'teacher', 'student')
@Get('justifications/student/:studentId')
getStudentJustifications(@Param('studentId') studentId: string) {
  return this.attendanceService.findJustificationsByStudentId(studentId);
}

@Roles('admin')
@Post('access-logs')
createAccessLog(@Body() dto: CreateAccessLogDto){
  return this.attendanceService.createAccesLog(dto);
}
@Roles('admin', 'teacher')
@Get('justifications/search/by-student')
searchJustificationsByStudentName(@Query('name') name: string){
return this.attendanceService.findJustificationsByStudentName(name);
}

@Roles ('admin')
@Get ('access-logs/student/:studentId')
getStudentAccessLogs(@Param('studentId') studentId: string){
return this.attendanceService.findAccessLogsByStudent(studentId);
}

 @Roles ('admin')
 @Get('access-logs/search/by-student')
 searchAccessLogsByName(@Query('name') name: string){
  return this.attendanceService.findAccessLogByStudentName(name);
 }


}