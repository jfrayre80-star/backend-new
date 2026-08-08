import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as path from "path";
import * as fs from "fs";

import { Submissions } from "../evaluation/Submissions";
import { ActivityDeliveries } from "../evaluation/ActivityDeliveries";
import { Students } from "../users/Students";
import { WeeklyLogs } from "../dual/WeeklyLogs";

/**
 * Carpeta donde se guardan los archivos de evidencia subidos.
 */
const UPLOADS_DIR = path.join(process.cwd(), "uploads", "evidence");

/**
 * Tipos de archivo aceptados de forma general cuando la actividad no los
 * restringe (PDF, imágenes y documentos de oficina).
 */
const DEFAULT_ALLOWED = [
  "pdf",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "txt",
  "ppt",
  "pptx",
];

/**
 * Servicio de carga de archivos de evidencia (RF-27).
 *
 * Se encarga de:
 *  - Validar que la entrega o bitácora exista y pertenezca al alumno.
 *  - Validar que el tipo de archivo esté permitido por la actividad.
 *  - Registrar la ruta del archivo en la entrega (Submissions.files) o en la
 *    bitácora (WeeklyLogs.fileUrl).
 */
@Injectable()
export class UploadsService {
  constructor(
    @InjectRepository(Submissions)
    private readonly submissionsRepository: Repository<Submissions>,

    @InjectRepository(ActivityDeliveries)
    private readonly activityDeliveriesRepository: Repository<ActivityDeliveries>,

    @InjectRepository(Students)
    private readonly studentsRepository: Repository<Students>,

    @InjectRepository(WeeklyLogs)
    private readonly weeklyLogsRepository: Repository<WeeklyLogs>,
  ) {
    // Garantiza que la carpeta de evidencia exista al arrancar el servicio.
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  /**
   * Devuelve la extensión de un archivo en minúsculas (sin el punto).
   */
  private getExtension(originalName: string): string {
    return path.extname(originalName).toLowerCase().replace(".", "");
  }

  /**
   * Obtiene la lista de extensiones permitidas de una entrega de actividad.
   * Si la actividad no define restricciones, se usan los tipos por defecto.
   */
  private getAllowedExtensions(delivery: ActivityDeliveries): string[] {
    if (!delivery.fileTypesAllowed) return DEFAULT_ALLOWED;
    return delivery.fileTypesAllowed
      .split(",")
      .map((ext) => ext.trim().toLowerCase().replace(".", ""))
      .filter(Boolean);
  }

  /**
   * Valida la extensión y el tamaño del archivo contra la configuración de la
   * entrega de actividad.
   */
  private validateAgainstDelivery(
    file: Express.Multer.File,
    delivery: ActivityDeliveries,
  ) {
    const extension = this.getExtension(file.originalname);
    const allowed = this.getAllowedExtensions(delivery);

    if (!allowed.includes(extension)) {
      throw new BadRequestException(
        `El tipo de archivo "${extension}" no está permitido. Tipos válidos: ${allowed.join(", ")}.`,
      );
    }

    const maxSizeMb = delivery.maxFileSizeMb ?? 10;
    const maxSizeBytes = maxSizeMb * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new BadRequestException(
        `El archivo excede el tamaño máximo permitido de ${maxSizeMb} MB.`,
      );
    }
  }

  /**
   * Sube un archivo de evidencia para una entrega de actividad.
   * Solo el alumno dueño de la entrega (o un administrador) puede adjuntar.
   */
  async uploadSubmissionEvidence(
    submissionId: string,
    file: Express.Multer.File,
    currentUser: { id: string; role: string },
  ) {
    if (!file) {
      throw new BadRequestException(
        'Debes enviar un archivo en el campo "file".',
      );
    }

    const submission = await this.submissionsRepository.findOne({
      where: { id: submissionId },
      relations: { activityDelivery: true, student: true },
    });

    if (!submission) {
      throw new NotFoundException("La entrega de actividad no existe.");
    }

    // Verificar que el alumno suba evidencia solo de sus propias entregas.
    if (currentUser.role === "student") {
      const student = await this.studentsRepository.findOne({
        where: { userId: currentUser.id },
      });
      if (!student || student.id !== submission.studentId) {
        throw new ForbiddenException(
          "Solo puedes adjuntar evidencia a tus propias entregas.",
        );
      }
    }

    const delivery = submission.activityDelivery;
    if (!delivery) {
      throw new NotFoundException(
        "La entrega de actividad no tiene configuración asociada.",
      );
    }

    // RF-27: solo actividades obligatorias (las que exigen archivo) aceptan evidencia.
    if (!delivery.requiresFile) {
      throw new BadRequestException(
        "Esta actividad no está configurada para recibir archivos de evidencia.",
      );
    }

    this.validateAgainstDelivery(file, delivery);

    const fileRecord = {
      fileName: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: `/uploads/evidence/${file.filename}`,
      uploadedAt: new Date().toISOString(),
    };

    // El campo files es un arreglo jsonb: se agrega el nuevo archivo.
    const filesField = submission.files as object[] | null;
    const existingFiles: object[] = Array.isArray(filesField) ? filesField : [];
    submission.files = [...existingFiles, fileRecord];

    await this.submissionsRepository.save(submission);

    return {
      message: "Evidencia adjuntada correctamente.",
      file: fileRecord,
      totalFiles: existingFiles.length + 1,
    };
  }

  /**
   * Sube un archivo de bitácora semanal DUAL.
   * Solo el alumno dueño de la bitácora (o un administrador) puede adjuntar.
   */
  async uploadWeeklyLogFile(
    weeklyLogId: string,
    file: Express.Multer.File,
    currentUser: { id: string; role: string },
  ) {
    if (!file) {
      throw new BadRequestException(
        'Debes enviar un archivo en el campo "file".',
      );
    }

    const weeklyLog = await this.weeklyLogsRepository.findOne({
      where: { id: weeklyLogId },
    });

    if (!weeklyLog) {
      throw new NotFoundException("La bitácora semanal no existe.");
    }

    if (currentUser.role === "student") {
      const student = await this.studentsRepository.findOne({
        where: { userId: currentUser.id },
      });
      if (!student || student.id !== weeklyLog.studentId) {
        throw new ForbiddenException(
          "Solo puedes adjuntar archivos a tus propias bitácoras.",
        );
      }
    }

    const extension = this.getExtension(file.originalname);
    if (!DEFAULT_ALLOWED.includes(extension)) {
      throw new BadRequestException(
        `El tipo de archivo "${extension}" no está permitido. Tipos válidos: ${DEFAULT_ALLOWED.join(", ")}.`,
      );
    }

    weeklyLog.fileUrl = `/uploads/evidence/${file.filename}`;
    await this.weeklyLogsRepository.save(weeklyLog);

    return {
      message: "Archivo de bitácora adjuntado correctamente.",
      fileUrl: weeklyLog.fileUrl,
    };
  }
}
