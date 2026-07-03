import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClassroomTypes } from '../classrooms/ClassroomTypes';

import { ClassroomTypesController } from './classroom-types.controller';
import { ClassroomTypesService } from './classroom-types.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClassroomTypes,
    ]),
  ],
  controllers: [ClassroomTypesController],
  providers: [ClassroomTypesService],
  exports: [ClassroomTypesService],
})
export class ClassroomTypesModule {}