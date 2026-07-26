import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CriterionScores } from './CriterionScores';
import { ComponentScores } from './ComponentScores';
import { ComponentCriteria } from './ComponentCriteria';
import { PartialGrades } from './PartialGrades';

import { CriterionScoresController } from './criterion-scores.controller';
import { CriterionScoresService } from './criterion-scores.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CriterionScores,
      ComponentScores,
      ComponentCriteria,
      PartialGrades,
    ]),
  ],
  controllers: [CriterionScoresController],
  providers: [CriterionScoresService],
  exports: [CriterionScoresService],
})
export class CriterionScoresModule {}