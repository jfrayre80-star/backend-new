import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DisciplinaryReports } from './DisciplinaryReports';
import { Students } from '../users/Students';
import { Users } from '../users/Users';

import { DisciplinaryReportsService } from './disciplinary-reports.service';
import { DisciplinaryReportsController } from './disciplinary-reports.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DisciplinaryReports,
      Students,
      Users,
    ]),
  ],
  controllers: [DisciplinaryReportsController],
  providers: [DisciplinaryReportsService],
  exports: [DisciplinaryReportsService],
})
export class DisciplinaryReportsModule {}