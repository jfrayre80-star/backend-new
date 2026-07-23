import { IsBoolean, IsNotEmpty, IsNumberString, IsOptional, IsUUID } from 'class-validator';

// Crea un registro en el historial académico del alumno
export class CreateAcademicHistoryDto {
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @IsUUID()
  @IsNotEmpty()
  semesterId: string;

  // Promedio de los 3 parciales (viene de PartialGrades)
  @IsOptional()
  @IsNumberString()
  partialsAverage?: string;

  // Nota del examen semestral (viene de Exams con category=semestral)
  @IsOptional()
  @IsNumberString()
  semesterExamScore?: string;

  // Nota final calculada: (partialsAverage * 80%) + (semesterExamScore * 20%)
  @IsOptional()
  @IsNumberString()
  finalGrade?: string;

  // Nota de examen extraordinario (si no aprueba)
  @IsOptional()
  @IsNumberString()
  extraordinaryGrade?: string;

  // Si aprobó o no
  @IsOptional()
  @IsBoolean()
  isApproved?: boolean;
}
