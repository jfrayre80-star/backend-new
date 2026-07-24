import {
  IsBoolean,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateExamAnswerDto {
  @IsUUID()
  @IsNotEmpty()
  attemptId: string;

  @IsUUID()
  @IsNotEmpty()
  questionId: string;

  // Label de la opción seleccionada (A, B, C, D) para multiple_choice
  @IsOptional()
  @IsString()
  selectedOptionLabel?: string;

  // Texto de la respuesta para open_question
  @IsOptional()
  @IsString()
  answerText?: string;

  // Solo se llena después de calificar (automática o manual)
  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;

  @IsOptional()
  @IsNumberString()
  score?: string;
}
