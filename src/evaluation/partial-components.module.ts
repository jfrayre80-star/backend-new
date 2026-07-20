import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PartialComponents } from './PartialComponents';
import { PartialConfigs } from './PartialConfigs';

import { PartialComponentsController } from './partial-components.controller';
import { PartialComponentsService } from './partial-components.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PartialComponents,
      PartialConfigs,
    ]),
  ],
  controllers: [PartialComponentsController],
  providers: [PartialComponentsService],
  exports: [PartialComponentsService],
})
export class PartialComponentsModule {}