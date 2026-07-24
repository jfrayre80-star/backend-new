import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { StartAttendanceDto, ScanQrDto } from './dto/start-attendance.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

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
}