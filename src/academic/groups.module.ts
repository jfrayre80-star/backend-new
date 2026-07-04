import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Groups } from './Groups';
import { Specialties } from './Specialties';
import { Semesters } from './Semesters';
import { Classrooms } from '../classrooms/Classrooms';

import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Groups,
      Specialties,
      Semesters,
      Classrooms,
    ]),
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}