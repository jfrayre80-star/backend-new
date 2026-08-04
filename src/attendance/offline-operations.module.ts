import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfflineOperations } from './OfflineOperations';
import { OfflineOperationsService } from './offline-operations.service';
import { OfflineOperationsController } from './offline-operations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OfflineOperations])],
  controllers: [OfflineOperationsController],
  providers: [OfflineOperationsService],
  exports: [OfflineOperationsService],
})
export class OfflineOperationsModule {}