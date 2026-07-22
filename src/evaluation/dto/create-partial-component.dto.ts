import {
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreatePartialComponentDto {
  @IsUUID()
  partialConfigId: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @IsNumberString()
  @Min(0.01)
  @Max(100)
  weight: string;

  @IsInt()
  sortOrder: number;
}