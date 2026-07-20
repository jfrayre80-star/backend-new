import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateActivityDto {
  @IsUUID()
  partialComponentId: string;

  @IsUUID()
  subjectId: string;

  @IsUUID()
  teacherId: string;

  @IsUUID()
  groupId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  rubricDescription?: string;

  @IsOptional()
  @IsIn(['assignment', 'quiz'])
  activityType?: 'assignment' | 'quiz';

  @IsNumberString()
  weight: string;

  @IsOptional()
  @IsBoolean()
  requiresFile?: boolean;

  @IsOptional()
  @IsString()
  fileTypesAllowed?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxFileSizeMb?: number;

  @IsDateString()
  dueDate: Date;

  @IsOptional()
  @IsNumberString()
  minGrade?: string;

  @IsOptional()
  @IsBoolean()
  isReopened?: boolean;

  @IsOptional()
  @IsDateString()
  reopenedUntil?: Date;

  @IsOptional()
  @IsBoolean()
  reopenedForAll?: boolean;

  @IsOptional()
  @IsIn(['active', 'closed', 'reopened'])
  status?: 'active' | 'closed' | 'reopened';

  @IsOptional()
  @IsBoolean()
  allowsTeamSubmissions?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  maxTeamSize?: number;
}