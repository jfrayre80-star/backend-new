import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationQueue } from './NotificationQueue';
import { NotificationQueueService } from './notification-queue.service';
import { NotificationQueueController } from './notification-queue.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationQueue])],
  controllers: [NotificationQueueController],
  providers: [NotificationQueueService],
  exports: [NotificationQueueService],
})
export class NotificationQueueModule {}