import {
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateComponentCriterionDto {
  @IsUUID()
  partialComponentId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsNumberString()
  weight: string;

  @IsInt()
  @Min(0)
  sortOrder: number;
}