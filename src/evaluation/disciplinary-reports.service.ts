import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DisciplinaryReports } from './DisciplinaryReports';
import { Students } from '../users/Students';
import { Users } from '../users/Users';

import { CreateDisciplinaryReportDto } from './dto/create-disciplinary-report.dto';
import { UpdateDisciplinaryReportDto } from './dto/update-disciplinary-report.dto';

@Injectable()
export class DisciplinaryReportsService {
  constructor(
    @InjectRepository(DisciplinaryReports)
    private readonly disciplinaryReportsRepository: Repository<DisciplinaryReports>,

    @InjectRepository(Students)
    private readonly studentsRepository: Repository<Students>,

    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  private async validateStudent(
    studentId: string,
  ): Promise<Students> {
    const student = await this.studentsRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException(
        `No se encontró el estudiante con id ${studentId}`,
      );
    }

    return student;
  }

  private async validateReporter(
    reportedById: string,
  ): Promise<Users> {
    const reporter = await this.usersRepository.findOne({
      where: { id: reportedById },
    });

    if (!reporter) {
      throw new NotFoundException(
        `No se encontró el usuario con id ${reportedById}`,
      );
    }

    return reporter;
  }

  async create(
    createDisciplinaryReportDto: CreateDisciplinaryReportDto,
  ): Promise<DisciplinaryReports> {
    const {
      studentId,
      reportedById,
      ...reportData
    } = createDisciplinaryReportDto;

    await this.validateStudent(studentId);
    await this.validateReporter(reportedById);

    const report =
      this.disciplinaryReportsRepository.create({
        ...reportData,
        studentId,
        reportedById,
      });

    const savedReport =
      await this.disciplinaryReportsRepository.save(report);

    return this.findOne(savedReport.id);
  }

  async findAll(): Promise<DisciplinaryReports[]> {
    return this.disciplinaryReportsRepository.find({
      relations: {
        student: {
          user: true,
        },
        reportedBy: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(
    id: string,
  ): Promise<DisciplinaryReports> {
    const report =
      await this.disciplinaryReportsRepository.findOne({
        where: { id },
        relations: {
          student: {
            user: true,
          },
          reportedBy: true,
        },
      });

    if (!report) {
      throw new NotFoundException(
        `No se encontró el reporte disciplinario con id ${id}`,
      );
    }

    return report;
  }

  async update(
    id: string,
    updateDto: UpdateDisciplinaryReportDto,
  ): Promise<DisciplinaryReports> {
    const report = await this.findOne(id);

    const studentId =
      updateDto.studentId ?? report.studentId;

    const reportedById =
      updateDto.reportedById ??
      report.reportedById;

    await this.validateStudent(studentId);
    await this.validateReporter(reportedById);

    const updatedReport =
      this.disciplinaryReportsRepository.merge(
        report,
        {
          ...updateDto,
          studentId,
          reportedById,
        },
      );

    await this.disciplinaryReportsRepository.save(
      updatedReport,
    );

    return this.findOne(id);
  }

  async remove(id: string): Promise<{
    message: string;
  }> {
    const report = await this.findOne(id);

    await this.disciplinaryReportsRepository.remove(
      report,
    );

    return {
      message:
        'Reporte disciplinario eliminado correctamente',
    };
  }
}