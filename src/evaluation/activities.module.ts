import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Activities } from './Activities';
import { Subjects } from '../academic/Subjects';
import { Teachers } from '../users/Teachers';
import { Groups } from '../academic/Groups';
import { PartialComponents } from './PartialComponents';

import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Activities,
      Subjects,
      Teachers,
      Groups,
      PartialComponents,
    ]),
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}