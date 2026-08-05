import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { OfflineOperationsService } from './offline-operations.service';
import { CreateOfflineOperationDto, UpdateOfflineOperationDto } from './dto/offline-operations.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Req } from '@nestjs/common';

@Controller('offline-operations')
export class OfflineOperationsController {
  constructor(private readonly offlineOperationsService: OfflineOperationsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  findAll(@Query('status') status?: string) {
    return this.offlineOperationsService.findAll(status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.offlineOperationsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateOfflineOperationDto) {
    return this.offlineOperationsService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateOfflineOperationDto) {
    return this.offlineOperationsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/complete')
  markCompleted(@Param('id', ParseUUIDPipe) id: string) {
    return this.offlineOperationsService.markCompleted(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.offlineOperationsService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'student', 'teacher')
@Post('sync')
sync(@Req() req: any, @Body() dto: CreateOfflineOperationDto) {
  return this.offlineOperationsService.sync(dto, req.user.id);
}
}