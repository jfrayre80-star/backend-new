import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notices } from './Notices';
import { Users } from '../users/Users';
import { Groups } from '../academic/Groups';
import { Students } from '../users/Students';
import { Parents } from '../users/Parents';
import { Teachers } from '../users/Teachers';
import { GroupEnrollments } from '../academic/GroupEnrollments';
import { Schedules } from '../academic/Schedules';
import { NoticesService } from './notices.service';
import { NoticesController } from './notices.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notices,
      Users,
      Groups,
      Students,
      Parents,
      Teachers,
      GroupEnrollments,
      Schedules,
    ]),
  ],
  controllers: [NoticesController],
  providers: [NoticesService],
  exports: [NoticesService],
})
export class NoticesModule {}