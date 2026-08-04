import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { CreateAlertDto, UpdateAlertDto } from './dto/alerts.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Roles('admin')
  @Get()
  findAll() {
    return this.alertsService.findAll();
  }

  @Roles('admin', 'parent')
  @Get('student/:studentId')
  findByStudent(@Param('studentId', ParseUUIDPipe) studentId: string, @Query('unread') unread?: string) {
    return this.alertsService.findByStudent(studentId, unread === 'true');
  }

  @Roles('admin', 'parent')
  @Get('parent/:parentId')
  findByParent(@Param('parentId', ParseUUIDPipe) parentId: string, @Query('unread') unread?: string) {
    return this.alertsService.findByParent(parentId, unread === 'true');
  }

  @Roles('admin', 'parent')
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.alertsService.findOne(id);
  }

  @Roles('admin')
  @Post()
  create(@Body() dto: CreateAlertDto) {
    return this.alertsService.create(dto);
  }

  @Roles('admin', 'parent')
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAlertDto) {
    return this.alertsService.update(id, dto);
  }

  @Roles('admin', 'parent')
  @Patch(':id/read')
  markAsRead(@Param('id', ParseUUIDPipe) id: string) {
    return this.alertsService.markAsRead(id);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.alertsService.remove(id);
  }
}