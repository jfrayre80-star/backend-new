import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { SubmissionsService } from './submissions.service';

import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('submissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubmissionsController {
  constructor(
    private readonly submissionsService: SubmissionsService,
  ) {}

  @Roles('student', 'admin')
  @Post()
  create(
    @Body() createSubmissionDto: CreateSubmissionDto,
  ) {
    return this.submissionsService.create(
      createSubmissionDto,
    );
  }

  @Roles('teacher', 'admin')
  @Get()
  findAll() {
    return this.submissionsService.findAll();
  }

  @Roles('teacher', 'admin')
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.submissionsService.findOne(id);
  }

  @Roles('teacher', 'admin')
  @Patch(':id/grade')
  grade(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() gradeSubmissionDto: GradeSubmissionDto,
  ) {
    return this.submissionsService.grade(
      id,
      gradeSubmissionDto,
    );
  }

  @Roles('student', 'admin')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSubmissionDto: UpdateSubmissionDto,
  ) {
    return this.submissionsService.update(
      id,
      updateSubmissionDto,
    );
  }

  @Roles('teacher', 'admin')
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.submissionsService.remove(id);
  }
}