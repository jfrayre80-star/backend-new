import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Submissions } from './Submissions';
import { ActivityDeliveries } from './ActivityDeliveries';
import { ActivityTeams } from './ActivityTeams';
import { ActivityTeamMembers } from './ActivityTeamMembers';
import { Students } from '../users/Students';
import { Users } from '../users/Users';

import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Submissions,
      ActivityDeliveries,
      ActivityTeams,
      ActivityTeamMembers,
      Students,
      Users,
    ]),
  ],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}