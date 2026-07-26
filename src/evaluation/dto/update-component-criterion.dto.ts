import { PartialType } from '@nestjs/mapped-types';
import { CreateComponentCriterionDto } from './create-component-criterion.dto';

export class UpdateComponentCriterionDto extends PartialType(
  CreateComponentCriterionDto,
) {}