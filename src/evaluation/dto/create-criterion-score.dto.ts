import {
  IsNumberString,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateCriterionScoreDto {
  @IsUUID()
  componentScoreId: string;

  @IsUUID()
  componentCriterionId: string;

  @IsOptional()
  @IsNumberString()
  score?: string;
}