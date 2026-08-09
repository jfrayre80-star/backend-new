import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Submissions } from './Submissions';
import { Activities } from './Activities';
import { ActivityDeliveries } from './ActivityDeliveries';
import { ActivityTeams } from './ActivityTeams';
import { ActivityTeamMembers } from './ActivityTeamMembers';
import { Students } from '../users/Students';
import { Users } from '../users/Users';
import { GroupEnrollments } from '../academic/GroupEnrollments';

import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Submissions,
      Activities,
      ActivityDeliveries,
      ActivityTeams,
      ActivityTeamMembers,
      Students,
      Users,
      GroupEnrollments,
    ]),
  ],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}