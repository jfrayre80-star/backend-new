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

import { PartialComponentsService } from './partial-components.service';
import { CreatePartialComponentDto } from './dto/create-partial-component.dto';
import { UpdatePartialComponentDto } from './dto/update-partial-component.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('partial-components')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'teacher')
export class PartialComponentsController {
  constructor(
    private readonly partialComponentsService: PartialComponentsService,
  ) {}

  @Post()
  create(
    @Body()
    createPartialComponentDto: CreatePartialComponentDto,
  ) {
    return this.partialComponentsService.create(
      createPartialComponentDto,
    );
  }

  @Get()
  findAll() {
    return this.partialComponentsService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.partialComponentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    updatePartialComponentDto: UpdatePartialComponentDto,
  ) {
    return this.partialComponentsService.update(
      id,
      updatePartialComponentDto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.partialComponentsService.remove(id);
  }
}