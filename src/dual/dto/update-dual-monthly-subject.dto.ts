import { PartialType } from '@nestjs/mapped-types';
import { CreateDualMonthlySubjectDto } from './create-dual-monthly-subject.dto';

export class UpdateDualMonthlySubjectDto extends PartialType(
  CreateDualMonthlySubjectDto,
) {}
