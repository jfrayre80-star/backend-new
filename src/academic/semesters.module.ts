import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SemestersService } from './semesters.service';
import { SemestersController } from './semesters.controller';
import { Semesters } from '../academic/Semesters';

@Module({
  imports: [TypeOrmModule.forFeature([Semesters])],
  controllers: [SemestersController],
  providers: [SemestersService],
  exports: [SemestersService],
})
export class SemestersModule {}