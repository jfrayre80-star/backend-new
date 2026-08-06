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
import { ExtraordinaryEnrollmentsService } from './extraordinary-enrollments.service';
import { CreateExtraordinaryEnrollmentDto } from './dto/create-extraordinary-enrollment.dto';
import { UpdateExtraordinaryEnrollmentDto } from './dto/update-extraordinary-enrollment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('extraordinary-enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class ExtraordinaryEnrollmentsController {
  constructor(
    private readonly enrollmentsService: ExtraordinaryEnrollmentsService,
  ) {}

  @Get()
  findAll() {
    return this.enrollmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.enrollmentsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateExtraordinaryEnrollmentDto) {
    return this.enrollmentsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExtraordinaryEnrollmentDto,
  ) {
    return this.enrollmentsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.enrollmentsService.remove(id);
  }
}
