import {
  IsBoolean,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class GradeSubmissionDto {
  @IsNumberString()
  grade: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  feedback?: string;

  @IsUUID()
  gradedById: string;

  @IsOptional()
  @IsBoolean()
  isAutoGraded?: boolean;
}