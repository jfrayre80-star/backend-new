import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateExamQuestionDto {
  @IsUUID()
  @IsNotEmpty()
  examId: string;

  @IsIn(['multiple_choice', 'open'])
  questionType: 'multiple_choice' | 'open';

  @IsString()
  @IsNotEmpty()
  questionText: string;

  @IsNumberString()
  points: string;

  @IsInt()
  sortOrder: number;

  // Opciones para multiple_choice: ["A", "B", "C", "D"]
  @IsOptional()
  @IsArray()
  options?: string[];

  // Opciones correctas: ["A"] o ["A", "C"] para multiple
  @IsOptional()
  @IsArray()
  correctOptions?: string[];

  @IsOptional()
  @IsIn(['single', 'multiple'])
  selectionType?: 'single' | 'multiple';

  @IsOptional()
  @IsUUID()
  questionContextId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxCharacters?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
