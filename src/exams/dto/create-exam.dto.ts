import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateExamDto {
  @IsUUID()
  @IsNotEmpty()
  groupId: string;

  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @IsUUID()
  @IsNotEmpty()
  teacherId: string;

  // CHECK constraint: uno u otro, nunca ambos ni ninguno
  @IsOptional()
  @IsUUID()
  activityId?: string;

  @IsOptional()
  @IsUUID()
  evaluationSchemeId?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsNumberString()
  weight: string;

  @IsInt()
  @Min(1)
  timeLimitMinutes: number;

  @IsIn(['multiple_choice', 'open_question', 'mixed'])
  examType: 'multiple_choice' | 'open_question' | 'mixed';

  @IsOptional()
  @IsIn(['partial', 'semestral', 'extraordinary'])
  examCategory?: 'partial' | 'semestral' | 'extraordinary';

  @IsOptional()
  @IsInt()
  @Min(1)
  maxAttempts?: number;

  @IsOptional()
  @IsBoolean()
  requiresFullScreen?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxFocusLosses?: number;

  @IsOptional()
  @IsNumberString()
  passingGrade?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
