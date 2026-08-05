import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateDualMonthlySubjectDto {
  @IsUUID()
  @IsNotEmpty()
  dualEnrollmentId: string;

  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;

  @IsOptional()
  @IsBoolean()
  isTroncoComun?: boolean;
}
