import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notices } from './Notices';
import { Users } from '../users/Users';
import { Groups } from '../academic/Groups';
import { NoticesService } from './notices.service';
import { NoticesController } from './notices.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Notices, Users, Groups])],
  controllers: [NoticesController],
  providers: [NoticesService],
  exports: [NoticesService],
})
export class NoticesModule {}