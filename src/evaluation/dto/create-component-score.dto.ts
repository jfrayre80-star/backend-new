import {
  IsNumberString,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateComponentScoreDto {
  @IsUUID()
  partialGradeId: string;

  @IsUUID()
  partialComponentId: string;

  @IsOptional()
  @IsNumberString()
  score?: string;
}