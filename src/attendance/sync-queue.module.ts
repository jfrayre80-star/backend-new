import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncQueue } from './SyncQueue';
import { SyncQueueService } from './sync-queue.service';
import { SyncQueueController } from './sync-queue.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SyncQueue])],
  controllers: [SyncQueueController],
  providers: [SyncQueueService],
  exports: [SyncQueueService],
})
export class SyncQueueModule {}