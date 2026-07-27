import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { PartialConfigsService } from './partial-configs.service';

import { CreatePartialConfigDto } from './dto/create-partial-config.dto';
import { UpdatePartialConfigDto } from './dto/update-partial-config.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('partial-configs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'teacher')
export class PartialConfigsController {
  constructor(
    private readonly partialConfigsService: PartialConfigsService,
  ) {}

  @Post()
  create(
    @Body() createPartialConfigDto: CreatePartialConfigDto,
  ) {
    return this.partialConfigsService.create(
      createPartialConfigDto,
    );
  }

  @Get()
  findAll() {
    return this.partialConfigsService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.partialConfigsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    updatePartialConfigDto: UpdatePartialConfigDto,
  ) {
    return this.partialConfigsService.update(
      id,
      updatePartialConfigDto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.partialConfigsService.remove(id);
  }
}