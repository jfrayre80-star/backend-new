import {
  BadRequestException,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { randomBytes } from "crypto";
import * as fs from "fs";
import * as path from "path";

import { UploadsService } from "./uploads.service";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { CurrentUser } from "../auth/current-user.decorator";

/**
 * Usuario autenticado (inyectado por JwtAuthGuard a través de CurrentUser).
 */
interface AuthUser {
  id: string;
  email: string | null;
  role: "admin" | "teacher" | "student" | "parent";
}

/**
 * Carpeta física donde se guardan las evidencias subidas.
 */
const EVIDENCE_DIR = path.join(process.cwd(), "uploads", "evidence");

/**
 * Almacenamiento de multer en disco: genera un nombre único para cada archivo
 * y garantiza que la carpeta de evidencia exista.
 */
const evidenceStorage = diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
    cb(null, EVIDENCE_DIR);
  },
  filename: (req, file, cb) => {
    const unique = randomBytes(16).toString("hex");
    cb(null, `${Date.now()}-${unique}${extname(file.originalname)}`);
  },
});

/**
 * Controlador de carga de archivos de evidencia (RF-27).
 *
 * Rutas:
 *  - POST /api/uploads/submissions/:submissionId  -> evidencia de una actividad
 *  - POST /api/uploads/weekly-logs/:weeklyLogId   -> archivo de bitácora DUAL
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("uploads")
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  /**
   * Sube un archivo de evidencia a una entrega de actividad.
   * Permite al Alumno adjuntar PDF, imágenes o documentos en actividades
   * configuradas como obligatorias.
   */
  @Roles("student", "admin")
  @Post("submissions/:submissionId")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: evidenceStorage,
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  uploadSubmissionEvidence(
    @Param("submissionId", ParseUUIDPipe) submissionId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthUser,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Debes enviar un archivo en el campo "file".',
      );
    }
    return this.uploadsService.uploadSubmissionEvidence(submissionId, file, {
      id: user.id,
      role: user.role,
    });
  }

  /**
   * Sube un archivo adjunto a una bitácora semanal DUAL.
   */
  @Roles("student", "admin")
  @Post("weekly-logs/:weeklyLogId")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: evidenceStorage,
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  uploadWeeklyLogFile(
    @Param("weeklyLogId", ParseUUIDPipe) weeklyLogId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthUser,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Debes enviar un archivo en el campo "file".',
      );
    }
    return this.uploadsService.uploadWeeklyLogFile(weeklyLogId, file, {
      id: user.id,
      role: user.role,
    });
  }
}
