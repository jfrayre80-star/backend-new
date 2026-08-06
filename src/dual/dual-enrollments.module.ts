import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DualEnrollments } from './DualEnrollments';
import { Students } from '../users/Students';
import { Teachers } from '../users/Teachers';
import { CompanyTutors } from './CompanyTutors';

import { DualEnrollmentsController } from './dual-enrollments.controller';
import { DualEnrollmentsService } from './dual-enrollments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DualEnrollments,
      Students,
      Teachers,
      CompanyTutors,
    ]),
  ],
  controllers: [DualEnrollmentsController],
  providers: [DualEnrollmentsService],
  exports: [DualEnrollmentsService],
})
export class DualEnrollmentsModule {}
