import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ActivityTeams } from './ActivityTeams';
import { ActivityTeamMembers } from './ActivityTeamMembers';
import { Activities } from './Activities';
import { Students } from '../users/Students';

import { ActivityTeamsService } from './activity-teams.service';
import { ActivityTeamsController } from './activity-teams.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ActivityTeams,
      ActivityTeamMembers,
      Activities,
      Students,
    ]),
  ],
  controllers: [ActivityTeamsController],
  providers: [ActivityTeamsService],
  exports: [ActivityTeamsService],
})
export class ActivityTeamsModule {}