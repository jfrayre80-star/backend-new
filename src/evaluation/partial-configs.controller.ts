import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { PartialConfigsService } from './partial-configs.service';

import { CreatePartialConfigDto } from './dto/create-partial-config.dto';
import { UpdatePartialConfigDto } from './dto/update-partial-config.dto';

@Controller('partial-configs')
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
  findOne(@Param('id') id: string) {
    return this.partialConfigsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updatePartialConfigDto: UpdatePartialConfigDto,
  ) {
    return this.partialConfigsService.update(
      id,
      updatePartialConfigDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.partialConfigsService.remove(id);
  }
}