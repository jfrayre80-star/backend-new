import { IsOptional, IsString } from "class-validator";

/**
 * DTO para la carga masiva de alumnos aceptados (RF-05).
 *
 * El archivo puede venir en formato CSV o XML. Opcionalmente se puede indicar
 * una especialidad por defecto que se aplicará a las filas que no la traigan.
 */
export class ImportStudentsDto {
  @IsOptional()
  @IsString()
  defaultSpecialtyId?: string;
}
