import {
  IsBoolean,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreatePartialGradeDto {
  @IsUUID()
  studentId: string;

  @IsUUID()
  subjectId: string;

  @IsUUID()
  partialConfigId: string;

  @IsOptional()
  @IsNumberString()
  extraPoints?: string;

  @IsOptional()
  @IsNumberString()
  total?: string;

  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean;

  @IsOptional()
  @IsString()
  blockedReason?: string;

  @IsOptional()
  @IsBoolean()
  isStudyCircle?: boolean;
}