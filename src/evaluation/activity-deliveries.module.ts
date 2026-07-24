import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ActivityDeliveries } from './ActivityDeliveries';
import { Activities } from './Activities';

import { ActivityDeliveriesService } from './activity-deliveries.service';
import { ActivityDeliveriesController } from './activity-deliveries.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ActivityDeliveries,
      Activities,
    ]),
  ],
  controllers: [ActivityDeliveriesController],
  providers: [ActivityDeliveriesService],
  exports: [ActivityDeliveriesService],
})
export class ActivityDeliveriesModule {}