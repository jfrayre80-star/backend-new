import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from "@nestjs/common";

import { FormatsService } from "./formats.service";
import {
  CreateFormatTemplateDto,
  UpdateFormatTemplateDto,
} from "./dto/formats.dto";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

/**
 * Controlador de formatos oficiales y reportes en plataforma (RF-47).
 *
 * El sistema despliega el formato institucional por defecto para que los
 * alumnos redacten sus reportes y bitácoras de manera estandarizada.
 *
 * Rutas:
 *  - GET /api/formats               -> lista de formatos (student/admin)
 *  - GET /api/formats/:code         -> plantilla por código (student/admin)
 *  - POST /api/formats              -> crear formato (admin)
 *  - PATCH /api/formats/:id         -> actualizar formato (admin)
 *  - DELETE /api/formats/:id        -> desactivar formato (admin)
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("formats")
export class FormatsController {
  constructor(private readonly formatsService: FormatsService) {}

  @Roles("student", "admin")
  @Get()
  findAll(@Query("documentType") documentType?: string) {
    return this.formatsService.findAll(documentType);
  }

  @Roles("student", "admin")
  @Get(":code")
  findByCode(@Param("code") code: string) {
    return this.formatsService.findByCode(code);
  }

  @Roles("admin")
  @Post()
  create(@Body() dto: CreateFormatTemplateDto) {
    return this.formatsService.create(dto);
  }

  @Roles("admin")
  @Patch(":id")
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateFormatTemplateDto,
  ) {
    return this.formatsService.update(id, dto);
  }

  @Roles("admin")
  @Delete(":id")
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.formatsService.remove(id);
  }
}
