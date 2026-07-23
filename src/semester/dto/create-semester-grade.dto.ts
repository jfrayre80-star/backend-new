import { IsNotEmpty, IsNumberString, IsOptional, IsUUID } from 'class-validator';

// Crea una calificación semestral para un alumno en una materia
export class CreateSemesterGradeDto {
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  // FK obligatoria a SemesterConfigs (no se valida lógica, solo existe)
  @IsUUID()
  @IsNotEmpty()
  semesterConfigId: string;

  // Promedio de exámenes parciales (25% de cada parcial)
  @IsOptional()
  @IsNumberString()
  examScore?: string;

  // Promedio de evaluación continua (75% de cada parcial)
  @IsOptional()
  @IsNumberString()
  projectScore?: string;

  // Nota final calculada
  @IsOptional()
  @IsNumberString()
  total?: string;
}
