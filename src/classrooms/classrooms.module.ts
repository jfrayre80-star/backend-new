import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Classrooms } from './Classrooms';
import { ClassroomTypes } from './ClassroomTypes';

import { ClassroomsController } from './classrooms.controller';
import { ClassroomsService } from './classrooms.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Classrooms,
      ClassroomTypes,
    ]),
  ],
  controllers: [ClassroomsController],
  providers: [ClassroomsService],
  exports: [ClassroomsService],
})
export class ClassroomsModule {}