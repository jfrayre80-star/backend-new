import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Subjects } from './subjects';
import { CreateSubjectDto, UpdateSubjectDto } from './dto/subjects.dto';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subjects)
    private readonly subjectsRepository: Repository<Subjects>,
  ) {}

  async findAll() {
    return await this.subjectsRepository.find({
      where: {
        isActive: true,
      },
      relations: {
        specialty: true,
      },
    });
  }

  async findOne(id: string) {
    const subject = await this.subjectsRepository.findOne({
      where: {
        id,
        isActive: true,
      },
      relations: {
        specialty: true,
      },
    });

    if (!subject) {
      throw new NotFoundException('Materia no encontrada');
    }

    return subject;
  }

  async create(createSubjectDto: CreateSubjectDto) {
    const subject = this.subjectsRepository.create(createSubjectDto);

    return await this.subjectsRepository.save(subject);
  }

  async update(id: string, updateSubjectDto: UpdateSubjectDto) {
    const subject = await this.findOne(id);

    Object.assign(subject, updateSubjectDto);

    return await this.subjectsRepository.save(subject);
  }

  async remove(id: string) {
    const subject = await this.findOne(id);

    subject.isActive = false;

    return await this.subjectsRepository.save(subject);
  }
}