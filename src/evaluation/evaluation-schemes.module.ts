import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EvaluationSchemes } from './EvaluationSchemes';
import { Subjects } from '../academic/Subjects';
import { Groups } from '../academic/Groups';
import { Teachers } from '../users/Teachers';

import { EvaluationSchemesController } from './evaluation-schemes.controller';
import { EvaluationSchemesService } from './evaluation-schemes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EvaluationSchemes,
      Subjects,
      Groups,
      Teachers,
    ]),
  ],
  controllers: [EvaluationSchemesController],
  providers: [EvaluationSchemesService],
  exports: [EvaluationSchemesService],
})
export class EvaluationSchemesModule {}