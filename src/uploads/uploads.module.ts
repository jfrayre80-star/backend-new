import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Submissions } from "../evaluation/Submissions";
import { ActivityDeliveries } from "../evaluation/ActivityDeliveries";
import { Students } from "../users/Students";
import { WeeklyLogs } from "../dual/WeeklyLogs";

import { UploadsService } from "./uploads.service";
import { UploadsController } from "./uploads.controller";

/**
 * Módulo de carga de archivos de evidencia (RF-27).
 *
 * Permite al Alumno subir archivos (PDF, imágenes y documentos) como evidencia
 * de una actividad o de una bitácora semanal DUAL. Los archivos se guardan en
 * disco (carpeta "uploads/evidence") y la referencia se registra en el campo
 * "files" de la entrega (Submissions) o en el "fileUrl" de la bitácora.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Submissions,
      ActivityDeliveries,
      Students,
      WeeklyLogs,
    ]),
  ],
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
