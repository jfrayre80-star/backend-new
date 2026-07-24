import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';

import { AttendanceRecords } from './AttendanceRecords';
import { QrCodes } from './QrCodes';
import { Schedules } from '../academic/Schedules';
import {Students} from "../users/Students";


@Module({
  imports: [
    TypeOrmModule.forFeature([
      AttendanceRecords,
      QrCodes,
      Schedules,
      Students,
    ]),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}