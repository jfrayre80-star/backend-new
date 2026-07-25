import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';

import { AttendanceRecords } from './AttendanceRecords';
import { QrCodes } from './QrCodes';
import { AccessLogs } from './AccessLogs';
import { Justifications } from './Justifications';

import { Schedules } from '../academic/Schedules';
import { GroupEnrollments } from '../academic/GroupEnrollments';

import { Students } from '../users/Students';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AttendanceRecords,
      QrCodes,
      Schedules,
      Students,
      Justifications,
      GroupEnrollments,
      AccessLogs,
    ]),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}