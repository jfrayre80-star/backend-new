import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Specialties } from './Specialties';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';

@Injectable()
export class SpecialtiesService {
constructor(
@InjectRepository(Specialties)
private specialtiesRepository: Repository<Specialties>
){}

async findAll(){
    return await this.specialtiesRepository.find({
        where: {isActive: true}
    });
}

  async findOne(id: string) {
    const specialty = await this.specialtiesRepository.findOne({
      where: { id, isActive: true },
    });
    if (!specialty) {
      throw new NotFoundException('Especialidad no encontrada');
    }
    return specialty;
  }

  private async findById(id: string) {
  const specialty = await this.specialtiesRepository.findOne({
    where: { id },
  });
  if (!specialty) {
    throw new NotFoundException('Especialidad no encontrada');
  }
  return specialty;
}

  async create(createSpecialtyDto: CreateSpecialtyDto) {
const existingSpecialty = await this.specialtiesRepository.findOne({
      where: { code: createSpecialtyDto.code, isActive: true }
    });
    if (existingSpecialty) {
      throw new ConflictException('La especialidad ya existe');
    }
    const specialty = this.specialtiesRepository.create(createSpecialtyDto);
    return await this.specialtiesRepository.save(specialty);
}
    async update (updateSpecialtyDto: UpdateSpecialtyDto, id: string) {
    const Specialty = await this.findById(id);
    if (!Specialty) {
      throw new NotFoundException('Especialidad no encontrada');
    }

    if (updateSpecialtyDto.isActive !== undefined) {
    Specialty.isActive = updateSpecialtyDto.isActive;
    }

    Object.assign(Specialty, updateSpecialtyDto);
    return await this.specialtiesRepository.save(Specialty);
}


async remove(id: string) {
    const Specialty = await this.findOne(id);
    Specialty.isActive = false;
    return await this.specialtiesRepository.save(Specialty);
}
  }