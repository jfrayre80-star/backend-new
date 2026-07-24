import { PartialType } from '@nestjs/mapped-types';
import { CreateActivityExceptionDto } from './create-activity-exception.dto';

export class UpdateActivityExceptionDto extends PartialType(
  CreateActivityExceptionDto,
) {}