import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ClassroomTypesService } from './classroom-types.service';
import { CreateClassroomTypeDto } from './dto/create-classroom-type.dto';
import { UpdateClassroomTypeDto } from './dto/update-classroom-type.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(
    @Body() createClassroomTypeDto: CreateClassroomTypeDto,
  ) {
    return this.classroomTypesService.create(
      createClassroomTypeDto,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.classroomTypesService.remove(id);
  }
}