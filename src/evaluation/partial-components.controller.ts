import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { PartialComponentsService } from './partial-components.service';
import { CreatePartialComponentDto } from './dto/create-partial-component.dto';
import { UpdatePartialComponentDto } from './dto/update-partial-component.dto';

@Controller('partial-components')
export class PartialComponentsController {
  constructor(
    private readonly partialComponentsService: PartialComponentsService,
  ) {}

  @Post()
  create(
    @Body() createPartialComponentDto: CreatePartialComponentDto,
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
  findOne(@Param('id') id: string) {
    return this.partialComponentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updatePartialComponentDto: UpdatePartialComponentDto,
  ) {
    return this.partialComponentsService.update(
      id,
      updatePartialComponentDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.partialComponentsService.remove(id);
  }
}