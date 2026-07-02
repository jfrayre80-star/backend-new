import {PartialType} from '@nestjs/mapped-types';
import {IsOptional, IsBoolean} from 'class-validator';
import {CreateSpecialtyDto} from './create-specialty.dto';

export class UpdateSpecialtyDto extends PartialType(CreateSpecialtyDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}