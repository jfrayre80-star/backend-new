import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

/**
 * Define una sección del formato institucional.
 */
export class FormatSectionDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsIn(["text", "textarea", "select", "file"])
  type: "text" | "textarea" | "select" | "file";

  @IsBoolean()
  required: boolean;

  @IsOptional()
  order?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];
}

/**
 * DTO para crear o actualizar una plantilla de formato institucional (RF-47).
 */
export class CreateFormatTemplateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(["bitacora_semanal", "reporte_mensual"])
  @IsNotEmpty()
  documentType: "bitacora_semanal" | "reporte_mensual";

  @IsArray()
  @IsObject({ each: true })
  @MinLength(1)
  sections: FormatSectionDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

/**
 * DTO para actualizar parcialmente una plantilla de formato.
 */
export class UpdateFormatTemplateDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(["bitacora_semanal", "reporte_mensual"])
  documentType?: "bitacora_semanal" | "reporte_mensual";

  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  sections?: FormatSectionDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
