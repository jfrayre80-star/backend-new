import { Controller, Get, Post, Query, UseGuards } from "@nestjs/common";

import { AutomationService } from "./automation.service";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

/**
 * Controlador de automatización.
 *
 * Expone endpoints para disparar manualmente los procesos de segundo plano
 * (RF-48, RF-50 y RF-23) y consultar el monitor de alumnos en riesgo.
 * Solo un administrador puede ejecutarlos.
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("automation")
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  /**
   * RF-48: Genera recordatorios de bitácoras semanales DUAL pendientes.
   */
  @Roles("admin")
  @Post("weekly-logs")
  runWeeklyLogReminders() {
    return this.automationService.runWeeklyLogReminders();
  }

  /**
   * RF-48: Genera recordatorios de actividades por vencer.
   */
  @Roles("admin")
  @Post("activities")
  runActivityReminders() {
    return this.automationService.runActivityReminders();
  }

  /**
   * RF-50: Dispara alertas automáticas de asistencia para alumnos en riesgo.
   */
  @Roles("admin")
  @Post("risk-alerts")
  runRiskAlerts() {
    return this.automationService.runAttendanceRiskAlerts();
  }

  /**
   * RF-23: Monitor de alumnos en riesgo por inasistencia.
   */
  @Roles("admin", "teacher")
  @Get("risk-monitor")
  getRiskMonitor(@Query("groupId") groupId?: string) {
    return this.automationService.getRiskMonitor(groupId);
  }
}
