import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { WeeklyLogs } from "../dual/WeeklyLogs";
import { Students } from "../users/Students";
import { DualEnrollments } from "../dual/DualEnrollments";
import { Activities } from "../evaluation/Activities";
import { ActivityDeliveries } from "../evaluation/ActivityDeliveries";
import { Submissions } from "../evaluation/Submissions";
import { GroupEnrollments } from "../academic/GroupEnrollments";
import { AttendanceRecords } from "../attendance/AttendanceRecords";
import { Alerts } from "../notifications/Alerts";

import { NotificationQueueModule } from "../notifications/notification-queue.module";
import { AlertsModule } from "../notifications/alerts.module";

import { AutomationService } from "./automation.service";
import { AutomationController } from "./automation.controller";

/**
 * Módulo de automatización.
 *
 * Cubre tres requisitos del RF/RFN:
 *  - RF-48: Recordatorios automatizados (bitácoras semanales DUAL y actividades
 *    próximas a vencer) que se generan en segundo plano.
 *  - RF-50: Disparador automático de alertas de asistencia cuando un alumno
 *    está en riesgo de reprobar por faltas.
 *  - RF-23: Monitor de alumnos en riesgo por inasistencia (vista analítica).
 *
 * Los recordatorios se generan con @nestjs/schedule (cron) y, además, se pueden
 * disparar manualmente desde el controlador para pruebas o soporte.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      WeeklyLogs,
      Students,
      DualEnrollments,
      Activities,
      ActivityDeliveries,
      Submissions,
      GroupEnrollments,
      AttendanceRecords,
      Alerts,
    ]),
    NotificationQueueModule,
    AlertsModule,
  ],
  controllers: [AutomationController],
  providers: [AutomationService],
  exports: [AutomationService],
})
export class AutomationModule {}
