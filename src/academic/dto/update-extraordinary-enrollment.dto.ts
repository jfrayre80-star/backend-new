import { PartialType } from '@nestjs/mapped-types';
import { CreateExtraordinaryEnrollmentDto } from './create-extraordinary-enrollment.dto';

export class UpdateExtraordinaryEnrollmentDto extends PartialType(
  CreateExtraordinaryEnrollmentDto,
) {}
