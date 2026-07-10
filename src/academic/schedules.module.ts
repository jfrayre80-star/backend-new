import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedules } from './Schedules';
import { Teachers } from '../users/Teachers';
import { Groups } from './Groups';
import { Subjects } from './Subjects';
import { Classrooms } from '../classrooms/Classrooms';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';

@Module({
  imports: [TypeOrmModule.forFeature([Schedules, Teachers, Groups, Subjects, Classrooms])],
  controllers: [SchedulesController],
  providers: [SchedulesService],
  exports: [SchedulesService],
})
export class SchedulesModule {}