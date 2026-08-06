import { Controller, Get, Post, Put, Delete, Body, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ExamAttemptsService } from './exam-attempts.service';
import { CreateExamAttemptDto, GradeExamAttemptDto } from './dto/create-exam-attempt.dto';
import { UpdateExamAttemptDto } from './dto/update-exam-attempt.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('exam-attempts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class ExamAttemptsController {
  constructor(private readonly attemptsService: ExamAttemptsService) {}

  @Get()
  findAll() {
    return this.attemptsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.attemptsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateExamAttemptDto) {
    return this.attemptsService.create(dto);
  }

  @Post(':id/grade')
  grade(@Param('id', ParseUUIDPipe) id: string, @Body() dto: GradeExamAttemptDto) {
    return this.attemptsService.grade(id, dto);
  }

  @Post(':id/focus-loss')
  logFocusLoss(@Param('id', ParseUUIDPipe) id: string) {
    return this.attemptsService.logFocusLoss(id);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateExamAttemptDto) {
    return this.attemptsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.attemptsService.remove(id);
  }
}
