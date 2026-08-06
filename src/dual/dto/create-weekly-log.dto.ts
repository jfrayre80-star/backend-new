import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateWeeklyLogDto {
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @IsUUID()
  @IsOptional()
  subjectId?: string;

  @IsInt()
  @Min(1)
  @Max(53)
  weekNumber: number;

  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  companyFeedback?: string;

  @IsOptional()
  @IsString()
  academicFeedback?: string;

  @IsOptional()
  @IsString()
  companyGrade?: string;

  @IsOptional()
  @IsString()
  academicGrade?: string;

  @IsOptional()
  @IsDateString()
  submittedAt?: string;

  @IsOptional()
  @IsObject()
  metadata?: object;
}

export class GradeWeeklyLogDto {
  @IsOptional()
  @IsString()
  companyFeedback?: string;

  @IsOptional()
  @IsString()
  academicFeedback?: string;

  @IsOptional()
  @IsString()
  companyGrade?: string;

  @IsOptional()
  @IsString()
  academicGrade?: string;
}
