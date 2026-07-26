import { PartialType } from '@nestjs/mapped-types';
import { CreateComponentScoreDto } from './create-component-score.dto';

export class UpdateComponentScoreDto extends PartialType(
  CreateComponentScoreDto,
) {}