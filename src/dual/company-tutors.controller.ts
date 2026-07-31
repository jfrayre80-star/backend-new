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

import { CompanyTutorsService } from './company-tutors.service';
import { CreateCompanyTutorDto } from './dto/create-company-tutor.dto';
import { UpdateCompanyTutorDto } from './dto/update-company-tutor.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('company-tutors')
export class CompanyTutorsController {
  constructor(
    private readonly companyTutorsService: CompanyTutorsService,
  ) {}

  @Get()
  findAll() {
    return this.companyTutorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companyTutorsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() createCompanyTutorDto: CreateCompanyTutorDto) {
    return this.companyTutorsService.create(
      createCompanyTutorDto,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCompanyTutorDto: UpdateCompanyTutorDto,
  ) {
    return this.companyTutorsService.update(
      id,
      updateCompanyTutorDto,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companyTutorsService.remove(id);
  }
}
