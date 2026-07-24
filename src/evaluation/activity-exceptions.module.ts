import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ActivityExceptions } from './ActivityExceptions';
import { Activities } from './Activities';
import { Students } from '../users/Students';
import { Users } from '../users/Users';

import { ActivityExceptionsController } from './activity-exceptions.controller';
import { ActivityExceptionsService } from './activity-exceptions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ActivityExceptions,
      Activities,
      Students,
      Users,
    ]),
  ],
  controllers: [ActivityExceptionsController],
  providers: [ActivityExceptionsService],
  exports: [ActivityExceptionsService],
})
export class ActivityExceptionsModule {}