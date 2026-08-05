import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { NotificationQueueService } from './notification-queue.service';
import { CreateNotificationQueueDto, UpdateNotificationQueueDto } from './dto/notification-queue.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('notification-queue')
export class NotificationQueueController {
  constructor(private readonly notificationQueueService: NotificationQueueService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  findAll(@Query('status') status?: string) {
    return this.notificationQueueService.findAll(status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.notificationQueueService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateNotificationQueueDto) {
    return this.notificationQueueService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateNotificationQueueDto) {
    return this.notificationQueueService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/complete')
  markCompleted(@Param('id', ParseUUIDPipe) id: string) {
    return this.notificationQueueService.markCompleted(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/fail')
  markFailed(@Param('id', ParseUUIDPipe) id: string, @Body('errorMessage') errorMessage: string) {
    return this.notificationQueueService.markFailed(id, errorMessage);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/retry')
  retry(@Param('id', ParseUUIDPipe) id: string) {
    return this.notificationQueueService.retry(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.notificationQueueService.remove(id);
  }
    @Roles('admin')
  @Patch(':id/process')
  process(@Param('id', ParseUUIDPipe) id: string) {
    return this.notificationQueueService.process(id);
  }
}