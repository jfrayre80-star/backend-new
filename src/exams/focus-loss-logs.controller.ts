import { Controller, Get, Post, Put, Delete, Body, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { FocusLossLogsService } from './focus-loss-logs.service';
import { CreateFocusLossLogDto } from './dto/create-focus-loss-log.dto';
import { UpdateFocusLossLogDto } from './dto/update-focus-loss-log.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('focus-loss-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class FocusLossLogsController {
  constructor(private readonly focusLossService: FocusLossLogsService) {}

  @Get()
  findAll() {
    return this.focusLossService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.focusLossService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateFocusLossLogDto) {
    return this.focusLossService.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateFocusLossLogDto) {
    return this.focusLossService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.focusLossService.remove(id);
  }
}
