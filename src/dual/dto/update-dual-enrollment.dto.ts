import { PartialType } from '@nestjs/mapped-types';
import { CreateDualEnrollmentDto } from './create-dual-enrollment.dto';

export class UpdateDualEnrollmentDto extends PartialType(
  CreateDualEnrollmentDto,
) {}
