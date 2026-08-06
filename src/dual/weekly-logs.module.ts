import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WeeklyLogs } from './WeeklyLogs';
import { Students } from '../users/Students';
import { Subjects } from '../academic/Subjects';

import { WeeklyLogsController } from './weekly-logs.controller';
import { WeeklyLogsService } from './weekly-logs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WeeklyLogs, Students, Subjects]),
  ],
  controllers: [WeeklyLogsController],
  providers: [WeeklyLogsService],
  exports: [WeeklyLogsService],
})
export class WeeklyLogsModule {}
