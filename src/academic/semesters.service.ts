import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Semesters } from '../academic/Semesters';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';

@Injectable()
export class SemestersService {
  constructor(
    @InjectRepository(Semesters)
    private readonly semestersRepository: Repository<Semesters>,
  ) {}

  findAll(): Promise<Semesters[]> {
    return this.semestersRepository.find();
  }

  async findOne(id: string): Promise<Semesters> {
    const semester = await this.semestersRepository.findOne({ where: { id } });
    if (!semester) {
      throw new NotFoundException(`Semestre no encontrado`);
    }
    return semester;
  }


  async create(createSemesterDto: CreateSemesterDto): Promise<Semesters> {
    return this.semestersRepository.save(this.semestersRepository.create(createSemesterDto));
  }
  
  async update(id: string, updateSemesterDto: UpdateSemesterDto): Promise<Semesters> {
    const semester = await this.findOne(id);
    Object.assign(semester, updateSemesterDto);
    return this.semestersRepository.save(semester);
  }

    async remove(id: string): Promise<void> {
    const semester = await this.findOne(id);
    semester.isActive = false;
    await this.semestersRepository.save(semester);
    }


}