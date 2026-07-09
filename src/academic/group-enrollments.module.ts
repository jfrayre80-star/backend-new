import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupEnrollments } from './GroupEnrollments';
import { Groups } from './Groups';
import { Students } from '../users/Students';
import { GroupEnrollmentsController } from './group-enrollments.controller';
import { GroupEnrollmentsService } from './group-enrollments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupEnrollments, Groups, Students]),
  ],
  controllers: [GroupEnrollmentsController],
  providers: [GroupEnrollmentsService],
  exports: [GroupEnrollmentsService],
})
export class GroupEnrollmentsModule {}
