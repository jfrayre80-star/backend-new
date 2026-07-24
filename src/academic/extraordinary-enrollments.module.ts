import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExtraordinaryEnrollments } from './ExtraordinaryEnrollments';
import { Students } from '../users/Students';
import { Subjects } from './Subjects';
import { Groups } from './Groups';
import { Semesters } from './Semesters';
import { ExtraordinaryEnrollmentsController } from './extraordinary-enrollments.controller';
import { ExtraordinaryEnrollmentsService } from './extraordinary-enrollments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExtraordinaryEnrollments,
      Students,
      Subjects,
      Groups,
      Semesters,
    ]),
  ],
  controllers: [ExtraordinaryEnrollmentsController],
  providers: [ExtraordinaryEnrollmentsService],
  exports: [ExtraordinaryEnrollmentsService],
})
export class ExtraordinaryEnrollmentsModule {}
