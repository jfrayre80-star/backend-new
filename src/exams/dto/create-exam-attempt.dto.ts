import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateExamAttemptDto {
  @IsUUID()
  @IsNotEmpty()
  examId: string;

  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  attemptNumber?: number;
}

// DTO para calificar un intento (profesor)
export class GradeExamAttemptDto {
  @IsOptional()
  @IsNumberString()
  manualScore?: string;

  @IsOptional()
  @IsBoolean()
  isAutoGraded?: boolean;
}
