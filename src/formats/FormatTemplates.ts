import { Column, Entity, Index } from "typeorm";

@Index("format_templates_pkey", ["id"], { unique: true })
@Index("format_templates_code_key", ["code"], { unique: true })
@Entity("format_templates", { schema: "public" })
export class FormatTemplates {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("character varying", {
    name: "code",
    unique: true,
    length: 50,
  })
  code: string;

  @Column("character varying", { name: "name", length: 150 })
  name: string;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  /**
   * Tipo de documento al que aplica el formato:
   *  - bitacora_semanal  -> WeeklyLogs (bitácoras semanales DUAL)
   *  - reporte_mensual   -> DualMonthlySubjects (reportes mensuales)
   */
  @Column("character varying", {
    name: "document_type",
    length: 30,
  })
  documentType: "bitacora_semanal" | "reporte_mensual";

  /**
   * Estructura del formato institucional. Cada sección tiene:
   *  - key: identificador único de la sección.
   *  - label: etiqueta visible para el alumno.
   *  - type: tipo de campo (text, textarea, select, file).
   *  - required: si es obligatoria.
   *  - order: orden de presentación.
   *  - options: opciones cuando type es select.
   */
  @Column("jsonb", { name: "sections", default: [] })
  sections: Array<{
    key: string;
    label: string;
    type: "text" | "textarea" | "select" | "file";
    required: boolean;
    order: number;
    options?: string[];
  }>;

  @Column("boolean", {
    name: "is_active",
    nullable: true,
    default: () => "true",
  })
  isActive: boolean | null;

  @Column("boolean", {
    name: "is_default",
    nullable: true,
    default: () => "false",
  })
  isDefault: boolean | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "now()",
  })
  createdAt: Date | null;

  @Column("timestamp with time zone", {
    name: "updated_at",
    nullable: true,
    default: () => "now()",
  })
  updatedAt: Date | null;
}
