import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { GroupEnrollmentsService } from './group-enrollments.service';
import { CreateGroupEnrollmentDto } from './dto/create-group-enrollment.dto';
import { UpdateGroupEnrollmentDto } from './dto/update-group-enrollment.dto';

@Controller('group-enrollments')
export class GroupEnrollmentsController {
  constructor(private readonly enrollmentsService: GroupEnrollmentsService) {}

  @Get()
  findAll() {
    return this.enrollmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.enrollmentsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateGroupEnrollmentDto) {
    return this.enrollmentsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateGroupEnrollmentDto) {
    return this.enrollmentsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.enrollmentsService.remove(id);
  }
}
