import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { ClassroomTypesService } from './classroom-types.service';
import { CreateClassroomTypeDto } from './dto/create-classroom-type.dto';
import { UpdateClassroomTypeDto } from './dto/update-classroom-type.dto';

@Controller('classroom-types')
export class ClassroomTypesController {
  constructor(
    private readonly classroomTypesService: ClassroomTypesService,
  ) {}

  @Get()
  findAll() {
    return this.classroomTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classroomTypesService.findOne(id);
  }

  @Post()
  create(
    @Body() createClassroomTypeDto: CreateClassroomTypeDto,
  ) {
    return this.classroomTypesService.create(
      createClassroomTypeDto,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateClassroomTypeDto: UpdateClassroomTypeDto,
  ) {
    return this.classroomTypesService.update(
      id,
      updateClassroomTypeDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.classroomTypesService.remove(id);
  }
}