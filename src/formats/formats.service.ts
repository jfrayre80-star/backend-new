import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { FormatTemplates } from "./FormatTemplates";
import {
  CreateFormatTemplateDto,
  UpdateFormatTemplateDto,
} from "./dto/formats.dto";

/**
 * Plantilla institucional por defecto de bitácora semanal DUAL (RF-47).
 *
 * El sistema despliega este formato estandarizado para que el alumno redacte
 * sus bitácoras de manera uniforme dentro de la plataforma.
 */
const DEFAULT_BITACORA_SEMANAL: Partial<FormatTemplates> = {
  code: "bitacora_semanal",
  name: "Bitácora semanal de práctica profesional",
  description:
    "Formato institucional para registrar las actividades realizadas durante la práctica profesional de la semana.",
  documentType: "bitacora_semanal",
  isActive: true,
  isDefault: true,
  sections: [
    {
      key: "datos_identificacion",
      label: "Datos de identificación",
      type: "textarea",
      required: true,
      order: 1,
    },
    {
      key: "actividades_realizadas",
      label: "Actividades realizadas",
      type: "textarea",
      required: true,
      order: 2,
    },
    {
      key: "aprendizajes",
      label: "Aprendizajes obtenidos",
      type: "textarea",
      required: true,
      order: 3,
    },
    {
      key: "dificultades",
      label: "Dificultades encontradas",
      type: "textarea",
      required: false,
      order: 4,
    },
    {
      key: "observaciones",
      label: "Observaciones",
      type: "textarea",
      required: false,
      order: 5,
    },
    {
      key: "autoevaluacion",
      label: "Autoevaluación",
      type: "select",
      required: true,
      order: 6,
      options: ["Excelente", "Bien", "Regular", "Necesita mejorar"],
    },
  ],
};

/**
 * Plantilla institucional por defecto de reporte mensual DUAL (RF-47).
 */
const DEFAULT_REPORTE_MENSUAL: Partial<FormatTemplates> = {
  code: "reporte_mensual",
  name: "Reporte mensual de práctica profesional",
  description:
    "Formato institucional para resumir las actividades y resultados del mes dentro de la empresa.",
  documentType: "reporte_mensual",
  isActive: true,
  isDefault: true,
  sections: [
    {
      key: "resumen",
      label: "Resumen del mes",
      type: "textarea",
      required: true,
      order: 1,
    },
    {
      key: "actividades",
      label: "Actividades desarrolladas",
      type: "textarea",
      required: true,
      order: 2,
    },
    {
      key: "resultados",
      label: "Resultados obtenidos",
      type: "textarea",
      required: true,
      order: 3,
    },
    {
      key: "horas",
      label: "Horas acumuladas en el mes",
      type: "text",
      required: true,
      order: 4,
    },
    {
      key: "observaciones",
      label: "Observaciones",
      type: "textarea",
      required: false,
      order: 5,
    },
  ],
};

/**
 * Servicio de formatos oficiales y reportes en plataforma (RF-47).
 *
 * Expone las plantillas institucionales para que los alumnos redacten sus
 * reportes y bitácoras de forma estandarizada, y permite a un administrador
 * crear o ajustar dichos formatos.
 */
@Injectable()
export class FormatsService implements OnModuleInit {
  constructor(
    @InjectRepository(FormatTemplates)
    private readonly formatsRepository: Repository<FormatTemplates>,
  ) {}

  /**
   * Al arrancar el sistema registra los formatos institucionales por defecto
   * si aún no existen.
   */
  async onModuleInit() {
    await this.seedDefaults();
  }

  /**
   * Crea el formato por defecto (bitácora semanal y reporte mensual) si no
   * existen plantillas activas para esos códigos.
   */
  private async seedDefaults() {
    for (const template of [
      DEFAULT_BITACORA_SEMANAL,
      DEFAULT_REPORTE_MENSUAL,
    ]) {
      const existing = await this.formatsRepository.findOne({
        where: { code: template.code as string },
      });
      if (!existing) {
        await this.formatsRepository.save(
          this.formatsRepository.create(template),
        );
      }
    }
  }

  /**
   * Lista los formatos activos, opcionalmente filtrados por tipo de documento.
   */
  async findAll(documentType?: string) {
    const where: {
      isActive: boolean;
      documentType?: "bitacora_semanal" | "reporte_mensual";
    } = { isActive: true };
    if (
      documentType === "bitacora_semanal" ||
      documentType === "reporte_mensual"
    ) {
      where.documentType = documentType;
    }

    return this.formatsRepository.find({
      where,
      order: { documentType: "ASC", name: "ASC" },
    });
  }

  /**
   * Busca un formato por su código institucional.
   * Es el endpoint que consume el frontend para renderizar el formulario.
   */
  async findByCode(code: string) {
    const format = await this.formatsRepository.findOne({
      where: { code, isActive: true },
    });
    if (!format) {
      throw new NotFoundException(
        `El formato institucional "${code}" no existe.`,
      );
    }
    return format;
  }

  /**
   * Busca el formato institucional por defecto de un tipo de documento.
   */
  async findDefaultByDocumentType(
    documentType: "bitacora_semanal" | "reporte_mensual",
  ) {
    return this.formatsRepository.findOne({
      where: { documentType, isDefault: true, isActive: true },
    });
  }

  /**
   * Obtiene el formato por defecto de bitácora semanal.
   */
  async findDefaultBitacora() {
    return this.findDefaultByDocumentType("bitacora_semanal");
  }

  /**
   * Obtiene el formato por defecto de reporte mensual.
   */
  async findDefaultReporte() {
    return this.findDefaultByDocumentType("reporte_mensual");
  }

  /**
   * Valida que el arreglo de secciones esté bien formado.
   */
  private validateSections(sections: CreateFormatTemplateDto["sections"]) {
    const keys = sections.map((section) => section.key);
    const uniqueKeys = new Set(keys);
    if (uniqueKeys.size !== keys.length) {
      throw new BadRequestException(
        "Las claves de las secciones deben ser únicas.",
      );
    }
  }

  /**
   * Crea un nuevo formato institucional.
   */
  async create(dto: CreateFormatTemplateDto) {
    const existing = await this.formatsRepository.findOne({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(
        `Ya existe un formato con el código "${dto.code}".`,
      );
    }

    this.validateSections(dto.sections);
    const format = this.formatsRepository.create({
      ...dto,
      sections: dto.sections.map((section, index) => ({
        ...section,
        order: section.order ?? index + 1,
      })),
    });
    return this.formatsRepository.save(format);
  }

  /**
   * Actualiza un formato institucional existente.
   */
  async update(id: string, dto: UpdateFormatTemplateDto) {
    const format = await this.formatsRepository.findOne({ where: { id } });
    if (!format) {
      throw new NotFoundException("El formato institucional no existe.");
    }

    if (dto.sections) {
      this.validateSections(dto.sections);
    }

    Object.assign(format, dto);
    format.updatedAt = new Date();
    return this.formatsRepository.save(format);
  }

  /**
   * Elimina (desactiva) un formato institucional.
   */
  async remove(id: string) {
    const format = await this.formatsRepository.findOne({ where: { id } });
    if (!format) {
      throw new NotFoundException("El formato institucional no existe.");
    }
    format.isActive = false;
    format.updatedAt = new Date();
    await this.formatsRepository.save(format);
    return { message: "Formato institucional desactivado." };
  }
}
