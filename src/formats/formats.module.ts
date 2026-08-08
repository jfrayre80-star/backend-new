import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { FormatTemplates } from "./FormatTemplates";

import { FormatsService } from "./formats.service";
import { FormatsController } from "./formats.controller";

/**
 * Módulo de formatos oficiales y reportes en plataforma (RF-47).
 *
 * Registra las plantillas institucionales por defecto y expone los endpoints
 * para que los alumnos redacten reportes y bitácoras estandarizados.
 */
@Module({
  imports: [TypeOrmModule.forFeature([FormatTemplates])],
  controllers: [FormatsController],
  providers: [FormatsService],
  exports: [FormatsService],
})
export class FormatsModule {}
