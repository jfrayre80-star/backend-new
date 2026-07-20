import { PartialType } from '@nestjs/mapped-types';
import { CreatePartialConfigDto } from './create-partial-config.dto';

export class UpdatePartialConfigDto extends PartialType(
  CreatePartialConfigDto,
) {}