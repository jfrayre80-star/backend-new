import { PartialType } from '@nestjs/mapped-types';
import { CreatePartialGradeDto } from './create-partial-grade.dto';

export class UpdatePartialGradeDto extends PartialType(
  CreatePartialGradeDto,
) {}