import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PartialConfigs } from './PartialConfigs';
import { EvaluationSchemes } from './EvaluationSchemes';

import { PartialConfigsService } from './partial-configs.service';
import { PartialConfigsController } from './partial-configs.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PartialConfigs,
      EvaluationSchemes,
    ]),
  ],
  controllers: [PartialConfigsController],
  providers: [PartialConfigsService],
  exports: [PartialConfigsService],
})
export class PartialConfigsModule {}