import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Roles } from "../auth/roles.decorator";

import { ImportsService } from "./imports.service";

/**
 * Controlador de carga masiva (RF-05).
 *
 * Permite al Administrador cargar un archivo .csv o .xml con la lista de
 * alumnos aceptados, ordenada por el puntaje del examen de admisión.
 */
@Controller("imports")
@Roles("admin")
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  /**
   * POST /api/imports/students
   *
   * Multipart con campo "file" (.csv o .xml). Opcionalmente se puede enviar el
   * campo "defaultSpecialtyId" para asignar una especialidad por defecto a las
   * filas que no la especifiquen.
   */
  @Post("students")
  @UseInterceptors(FileInterceptor("file"))
  async importStudents(@UploadedFile() file: Express.Multer.File) {
    return this.importsService.importStudents(file);
  }
}
