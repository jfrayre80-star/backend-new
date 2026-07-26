import { PartialType } from '@nestjs/mapped-types';
import { CreateCriterionScoreDto } from './create-criterion-score.dto';

export class UpdateCriterionScoreDto extends PartialType(
  CreateCriterionScoreDto,
) {}