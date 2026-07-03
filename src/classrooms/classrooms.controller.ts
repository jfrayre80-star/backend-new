import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { ClassroomsService } from './classrooms.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';

@Controller('classrooms')
export class ClassroomsController {
  constructor(
    private readonly classroomsService: ClassroomsService,
  ) {}

  @Get()
  findAll() {
    return this.classroomsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classroomsService.findOne(id);
  }

  @Post()
  create(
    @Body() createClassroomDto: CreateClassroomDto,
  ) {
    return this.classroomsService.create(createClassroomDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateClassroomDto: UpdateClassroomDto,
  ) {
    return this.classroomsService.update(
      id,
      updateClassroomDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.classroomsService.remove(id);
  }
}