import {Body, Controller, Delete, Get, Param, Patch, Post} from '@nestjs/common';
import {SpecialtiesService} from './specialties.service';
import {CreateSpecialtyDto} from './dto/create-specialty.dto';
import {UpdateSpecialtyDto} from './dto/update-specialty.dto';


@Controller('specialties')
export class SpecialtiesController {

constructor(private readonly specialtiesService: SpecialtiesService) {}
  @Get()
  async findAll() {
    return await this.specialtiesService.findAll();
  }

    @Get(':id')
    async findOne(@Param('id') id: string) {
      return await this.specialtiesService.findOne(id);
    }

    @Post()
    create(@Body() createSpecialtyDto: CreateSpecialtyDto) {
      return this.specialtiesService.create(createSpecialtyDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateSpecialtyDto: UpdateSpecialtyDto) {
      return this.specialtiesService.update(updateSpecialtyDto, id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
      return this.specialtiesService.remove(id);
    }

}