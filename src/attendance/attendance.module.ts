import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';

import { AttendanceRecords } from './AttendanceRecords';
import { QrCodes } from './QrCodes';

import { Schedules } from '../academic/Schedules';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AttendanceRecords,
      QrCodes,
      Schedules,
    ]),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}