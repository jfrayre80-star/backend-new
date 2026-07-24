import { Controller, Get, Post, Patch, Delete, Body, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ActiveSessionsService } from './active-sessions.service';
import { CreateActiveSessionDto, UpdateActiveSessionDto } from './dto/active-sessions.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('active-sessions')
export class ActiveSessionsController {
  constructor(private readonly sessionsService: ActiveSessionsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  findAll() {
    return this.sessionsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.sessionsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('user/:userId')
  findActiveByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.sessionsService.findActiveByUser(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateActiveSessionDto) {
    return this.sessionsService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/deactivate')
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.sessionsService.deactivate(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete('user/:userId/deactivate-all')
  deactivateAllByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.sessionsService.deactivateAllByUser(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.sessionsService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('clean-expired')
  cleanExpired() {
    return this.sessionsService.cleanExpired();
  }
}
