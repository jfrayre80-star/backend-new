import { Controller, Get, Post, Put, Delete, Body, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ExamAnswersService } from './exam-answers.service';
import { CreateExamAnswerDto } from './dto/create-exam-answer.dto';
import { UpdateExamAnswerDto } from './dto/update-exam-answer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('exam-answers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class ExamAnswersController {
  constructor(private readonly answersService: ExamAnswersService) {}

  @Get()
  findAll() {
    return this.answersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.answersService.findOne(id);
  }

  @Post()
  createOrUpdate(@Body() dto: CreateExamAnswerDto) {
    return this.answersService.createOrUpdate(dto);
  }

  @Post('auto-grade/:attemptId')
  autoGrade(@Param('attemptId', ParseUUIDPipe) attemptId: string) {
    return this.answersService.autoGrade(attemptId);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateExamAnswerDto) {
    return this.answersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.answersService.remove(id);
  }
}
