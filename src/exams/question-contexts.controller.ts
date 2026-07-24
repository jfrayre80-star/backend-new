import { Controller, Get, Post, Put, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { QuestionContextsService } from './question-contexts.service';
import { CreateQuestionContextDto } from './dto/create-question-context.dto';
import { UpdateQuestionContextDto } from './dto/update-question-context.dto';

@Controller('question-contexts')
export class QuestionContextsController {
  constructor(private readonly contextsService: QuestionContextsService) {}

  @Get()
  findAll() {
    return this.contextsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.contextsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateQuestionContextDto) {
    return this.contextsService.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateQuestionContextDto) {
    return this.contextsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.contextsService.remove(id);
  }
}
