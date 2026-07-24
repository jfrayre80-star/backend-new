import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SemesterConfigs } from './SemesterConfigs';
import { SemesterGrades } from './SemesterGrades';
import { AcademicHistory } from './AcademicHistory';
import { PartialGrades } from '../evaluation/PartialGrades';
import { Exams } from '../exams/Exams';
import { ExamAttempts } from '../exams/ExamAttempts';
import { Students } from '../users/Students';
import { Subjects } from '../academic/Subjects';
import { Semesters } from '../academic/Semesters';
import { EvaluationSchemes } from '../evaluation/EvaluationSchemes';
import { SemesterGradesService } from './semester-grades.service';
import { AcademicHistoryService } from './academic-history.service';
import { SemesterGradesController } from './semester-grades.controller';
import { AcademicHistoryController } from './academic-history.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SemesterConfigs,
      SemesterGrades,
      AcademicHistory,
      PartialGrades,
      Exams,
      ExamAttempts,
      Students,
      Subjects,
      Semesters,
      EvaluationSchemes,
    ]),
  ],
  controllers: [
    SemesterGradesController,
    AcademicHistoryController,
  ],
  providers: [
    SemesterGradesService,
    AcademicHistoryService,
  ],
  exports: [SemesterGradesService, AcademicHistoryService],
})
export class SemesterModule {}
