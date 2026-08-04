import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfflineOperations } from './OfflineOperations';
import { AccessLogs } from './AccessLogs';
import { OfflineOperationsService } from './offline-operations.service';
import { OfflineOperationsController } from './offline-operations.controller';
import { SyncQueueModule } from './sync-queue.module';

@Module({
  imports: [TypeOrmModule.forFeature([OfflineOperations, AccessLogs]), SyncQueueModule],
  controllers: [OfflineOperationsController],
  providers: [OfflineOperationsService],
  exports: [OfflineOperationsService],
})
export class OfflineOperationsModule {}