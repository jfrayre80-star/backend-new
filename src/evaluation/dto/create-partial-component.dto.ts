import {
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class CreatePartialComponentDto {
  @IsUUID()
  partialConfigId: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @IsNumberString()
  weight: string;

  @IsInt()
  sortOrder: number;
}