import { PartialType } from '@nestjs/mapped-types';
import { CreatePartialComponentDto } from './create-partial-component.dto';

export class UpdatePartialComponentDto extends PartialType(
  CreatePartialComponentDto,
) {}