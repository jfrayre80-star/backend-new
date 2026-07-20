import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PartialGrades } from './PartialGrades';
import { Students } from '../users/Students';
import { Subjects } from '../academic/Subjects';
import { PartialConfigs } from './PartialConfigs';

import { PartialGradesController } from './partial-grades.controller';
import { PartialGradesService } from './partial-grades.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PartialGrades,
      Students,
      Subjects,
      PartialConfigs,
    ]),
  ],
  controllers: [PartialGradesController],
  providers: [PartialGradesService],
  exports: [PartialGradesService],
})
export class PartialGradesModule {}