import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { SyncQueueService } from './sync-queue.service';
import { CreateSyncQueueDto, UpdateSyncQueueDto } from './dto/sync-queue.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('sync-queue')
export class SyncQueueController {
  constructor(private readonly syncQueueService: SyncQueueService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  findAll(@Query('status') status?: string) {
    return this.syncQueueService.findAll(status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.syncQueueService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateSyncQueueDto) {
    return this.syncQueueService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSyncQueueDto) {
    return this.syncQueueService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/complete')
  markCompleted(@Param('id', ParseUUIDPipe) id: string) {
    return this.syncQueueService.markCompleted(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/fail')
  markFailed(@Param('id', ParseUUIDPipe) id: string, @Body('errorMessage') errorMessage: string) {
    return this.syncQueueService.markFailed(id, errorMessage);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/retry')
  retry(@Param('id', ParseUUIDPipe) id: string) {
    return this.syncQueueService.retry(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.syncQueueService.remove(id);
  }
}