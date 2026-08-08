import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Students } from "../users/Students";
import { Users } from "../users/Users";
import { Parents } from "../users/Parents";
import { Specialties } from "../academic/Specialties";

import { ImportsService } from "./imports.service";
import { ImportsController } from "./imports.controller";

/**
 * Módulo de carga masiva (RF-05).
 *
 * Permite al Administrador cargar un archivo .csv o .xml con la lista de
 * alumnos aceptados, ordenada por el puntaje del examen de admisión, y los
 * distribuye automáticamente por especialidad.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Students, Users, Parents, Specialties])],
  controllers: [ImportsController],
  providers: [ImportsService],
  exports: [ImportsService],
})
export class ImportsModule {}
