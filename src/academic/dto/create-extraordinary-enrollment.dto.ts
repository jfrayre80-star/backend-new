import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateExtraordinaryEnrollmentDto {
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @IsUUID()
  @IsNotEmpty()
  groupId: string;

  @IsUUID()
  @IsNotEmpty()
  semesterId: string;

  @IsIn(['regular', 'recovery', 'intersemester'])
  @IsNotEmpty()
  type: 'regular' | 'recovery' | 'intersemester';

  @IsOptional()
  @IsNumberString()
  finalGrade?: string;

  @IsOptional()
  @IsBoolean()
  isApproved?: boolean;
}
