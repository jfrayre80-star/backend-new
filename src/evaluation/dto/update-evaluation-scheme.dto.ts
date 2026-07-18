import { PartialType } from '@nestjs/mapped-types';
import { CreateEvaluationSchemeDto } from './create-evaluation-scheme.dto';

export class UpdateEvaluationSchemeDto extends PartialType(
  CreateEvaluationSchemeDto,
) {}