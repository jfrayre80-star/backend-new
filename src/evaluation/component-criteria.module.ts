import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ComponentCriteria } from './ComponentCriteria';
import { PartialComponents } from './PartialComponents';

import { ComponentCriteriaController } from './component-criteria.controller';
import { ComponentCriteriaService } from './component-criteria.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ComponentCriteria,
      PartialComponents,
    ]),
  ],
  controllers: [ComponentCriteriaController],
  providers: [ComponentCriteriaService],
  exports: [ComponentCriteriaService],
})
export class ComponentCriteriaModule {}