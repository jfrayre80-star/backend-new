import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActiveSessions } from './ActiveSessions';
import { ActiveSessionsService } from './active-sessions.service';
import { ActiveSessionsController } from './active-sessions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ActiveSessions])],
  controllers: [ActiveSessionsController],
  providers: [ActiveSessionsService],
  exports: [ActiveSessionsService],
})
export class ActiveSessionsModule {}
