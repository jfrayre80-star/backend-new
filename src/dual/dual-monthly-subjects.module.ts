import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DualMonthlySubjects } from './DualMonthlySubjects';
import { DualEnrollments } from './DualEnrollments';
import { Subjects } from '../academic/Subjects';

import { DualMonthlySubjectsController } from './dual-monthly-subjects.controller';
import { DualMonthlySubjectsService } from './dual-monthly-subjects.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DualMonthlySubjects,
      DualEnrollments,
      Subjects,
    ]),
  ],
  controllers: [DualMonthlySubjectsController],
  providers: [DualMonthlySubjectsService],
  exports: [DualMonthlySubjectsService],
})
export class DualMonthlySubjectsModule {}
