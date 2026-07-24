import { PartialType } from '@nestjs/mapped-types';
import { CreateActivityDeliveryDto } from './create-activity-delivery.dto';

export class UpdateActivityDeliveryDto extends PartialType(
  CreateActivityDeliveryDto,
) {}