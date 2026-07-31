import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CompanyTutors } from './CompanyTutors';

import { CreateCompanyTutorDto } from './dto/create-company-tutor.dto';
import { UpdateCompanyTutorDto } from './dto/update-company-tutor.dto';

@Injectable()
export class CompanyTutorsService {
  constructor(
    @InjectRepository(CompanyTutors)
    private readonly companyTutorsRepository: Repository<CompanyTutors>,
  ) {}

  async findAll() {
    return await this.companyTutorsRepository.find({
      where: {
        isActive: true,
      },
      order: {
        fullName: 'ASC',
      },
    });
  }

  async findOne(id: string) {
    const companyTutor = await this.companyTutorsRepository.findOne({
      where: {
        id,
        isActive: true,
      },
    });

    if (!companyTutor) {
      throw new NotFoundException(
        'Tutor de empresa no encontrado.',
      );
    }

    return companyTutor;
  }

  async create(createDto: CreateCompanyTutorDto) {
    const companyTutor =
      this.companyTutorsRepository.create(createDto);

    return await this.companyTutorsRepository.save(companyTutor);
  }

  async update(
    id: string,
    updateDto: UpdateCompanyTutorDto,
  ) {
    const companyTutor = await this.findOne(id);

    Object.assign(companyTutor, updateDto);

    return await this.companyTutorsRepository.save(companyTutor);
  }

  async remove(id: string) {
    const companyTutor = await this.findOne(id);

    companyTutor.isActive = false;

    return await this.companyTutorsRepository.save(companyTutor);
  }
}
