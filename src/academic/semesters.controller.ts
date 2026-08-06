import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { SemestersService } from './semesters.service';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('semesters')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class SemestersController {
  constructor(private readonly semestersService: SemestersService) {}

@Get()
  findAll() {
    return this.semestersService.findAll();
  }

@Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.semestersService.findOne(id);
  }

@Post()
  create(@Body() createSemesterDto: CreateSemesterDto) {
    return this.semestersService.create(createSemesterDto);
  }

@Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateSemesterDto: UpdateSemesterDto) {
    return this.semestersService.update(id, updateSemesterDto);
  }

@Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.semestersService.remove(id);
  }

}