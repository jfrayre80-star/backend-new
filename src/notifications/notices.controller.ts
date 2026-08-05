import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseUUIDPipe, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { NoticesService } from './notices.service';
import { CreateNoticeDto, UpdateNoticeDto } from './dto/notices.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notices')
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @Roles('admin', 'teacher', 'student', 'parent')
  @Get()
  findAll(@Req() req: any, @Query('targetRole') targetRole?: string) {
    return this.noticesService.findAll(req.user, targetRole);
  }

  @Roles('admin', 'teacher', 'student', 'parent')
  @Get('global')
  findAllGlobal(@Req() req: any) {
    return this.noticesService.findAllGlobal(req.user);
  }

  @Roles('admin', 'teacher', 'student', 'parent')
  @Get(':id')
  findOne(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.noticesService.findOne(id, req.user);
  }

  @Roles('admin')
  @Post()
  create(@Req() req: any, @Body() dto: CreateNoticeDto) {
    dto.createdById = req.user.id;
    return this.noticesService.create(dto);
  }

  @Roles('admin')
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateNoticeDto) {
    return this.noticesService.update(id, dto);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.noticesService.remove(id);
  }
}