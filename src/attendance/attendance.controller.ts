import {Body, Controller, Post} from "@nestjs/common";
import {StartAttendanceDto} from "./dto/start-attendance.dto";
import {AttendanceService} from "./attendance.service";


@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('start')
start(@Body() dto: StartAttendanceDto,
) {
    return this.attendanceService.start(dto);
  }
}