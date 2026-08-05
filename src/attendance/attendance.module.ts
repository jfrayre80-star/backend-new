import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { AttendanceRecords } from './AttendanceRecords';
import { QrCodes } from './QrCodes';
import { Schedules } from '../academic/Schedules';
import {Students} from "../users/Students";
import {Justifications} from "./Justifications";
import { AccessLogs } from './AccessLogs';
import { GroupEnrollments } from '../academic/GroupEnrollments';
import { Parents } from "../users/Parents";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AttendanceRecords,
      QrCodes,
      Schedules,
      Students,
      Justifications,
      AccessLogs,
      GroupEnrollments,
      Parents,
    ]),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}