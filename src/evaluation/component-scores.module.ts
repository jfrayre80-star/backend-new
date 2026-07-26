import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ComponentScores } from './ComponentScores';
import { PartialComponents } from './PartialComponents';
import { PartialGrades } from './PartialGrades';

import { ComponentScoresController } from './component-scores.controller';
import { ComponentScoresService } from './component-scores.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ComponentScores,
      PartialComponents,
      PartialGrades,
    ]),
  ],
  controllers: [ComponentScoresController],
  providers: [ComponentScoresService],
  exports: [ComponentScoresService],
})
export class ComponentScoresModule {}