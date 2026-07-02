import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subjects } from '../academic/Subjects';
import { ConflictException } from '@nestjs/common';

import { SpecialtiesService } from '../academic/specialties.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subjects)
    private readonly subjectsRepository: Repository<Subjects>,

    private readonly specialtiesService: SpecialtiesService,
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
    const existingSubject = await this.subjectsRepository.findOne({
      where: {
        code: createSubjectDto.code,
      },
    });

    if (existingSubject) {
      throw new ConflictException(
        'Ya existe una materia con ese código.',
      );
    }

    const subject = this.subjectsRepository.create({
      code: createSubjectDto.code,
      name: createSubjectDto.name,
      description: createSubjectDto.description,
      imageUrl: createSubjectDto.imageUrl,
      credits: createSubjectDto.credits,
    });

    if (createSubjectDto.specialtyId) {
      const specialty = await this.specialtiesService.findOne(createSubjectDto.specialtyId);
      subject.specialty = specialty;
    }

    return await this.subjectsRepository.save(subject);
  }

  async update(id: string, updateSubjectDto: UpdateSubjectDto) {
    const subject = await this.findOne(id);

    if (
      updateSubjectDto.code &&
      updateSubjectDto.code !== subject.code
    ) {
      const existingSubject = await this.subjectsRepository.findOne({
        where: {
          code: updateSubjectDto.code,
        },
      });

      if (existingSubject) {
        throw new ConflictException(
          'Ya existe una materia con ese código.',
        );
      }
    }

    if (updateSubjectDto.specialtyId) {
      const specialty = await this.specialtiesService.findOne(updateSubjectDto.specialtyId);
      subject.specialty = specialty;
    }

    Object.assign(subject, {
      code: updateSubjectDto.code ?? subject.code,
      name: updateSubjectDto.name ?? subject.name,
      description: updateSubjectDto.description ?? subject.description,
      imageUrl: updateSubjectDto.imageUrl ?? subject.imageUrl,
      credits: updateSubjectDto.credits ?? subject.credits,
    });

    return await this.subjectsRepository.save(subject);
  }

  async remove(id: string) {
    const subject = await this.findOne(id);
    subject.isActive = false;
    return await this.subjectsRepository.save(subject);
  }
}