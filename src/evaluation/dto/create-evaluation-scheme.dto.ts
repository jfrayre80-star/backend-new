import {
  IsNumberString,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateEvaluationSchemeDto {
  @IsUUID()
  subjectId: string;

  @IsUUID()
  teacherId: string;

  @IsUUID()
  groupId: string;

  @IsOptional()
  @IsNumberString()
  partialsWeight?: string;

  @IsOptional()
  @IsNumberString()
  semesterWeight?: string;

  @IsOptional()
  @IsNumberString()
  attendanceMinimumPercent?: string;
}
