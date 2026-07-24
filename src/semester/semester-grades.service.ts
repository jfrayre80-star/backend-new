import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SemesterGrades } from './SemesterGrades';
import { PartialGrades } from '../evaluation/PartialGrades';
import { Exams } from '../exams/Exams';
import { Students } from '../users/Students';
import { Subjects } from '../academic/Subjects';
import { SemesterConfigs } from './SemesterConfigs';
import { CreateSemesterGradeDto } from './dto/create-semester-grade.dto';
import { UpdateSemesterGradeDto } from './dto/update-semester-grade.dto';

@Injectable()
export class SemesterGradesService {
  constructor(
    @InjectRepository(SemesterGrades)
    private readonly semesterGradesRepository: Repository<SemesterGrades>,
    @InjectRepository(PartialGrades)
    private readonly partialGradesRepository: Repository<PartialGrades>,
    @InjectRepository(Exams)
    private readonly examsRepository: Repository<Exams>,
    @InjectRepository(Students)
    private readonly studentsRepository: Repository<Students>,
    @InjectRepository(Subjects)
    private readonly subjectsRepository: Repository<Subjects>,
    @InjectRepository(SemesterConfigs)
    private readonly semesterConfigsRepository: Repository<SemesterConfigs>,
  ) {}

  // Retorna todas las calificaciones semestrales
  async findAll() {
    return await this.semesterGradesRepository.find({
      relations: { student: true, subject: true, semesterConfig: true },
    });
  }

  // Retorna una calificación semestral por ID
  async findOne(id: string) {
    const grade = await this.semesterGradesRepository.findOne({
      where: { id },
      relations: { student: true, subject: true, semesterConfig: true },
    });
    if (!grade) throw new NotFoundException('Calificación semestral no encontrada.');
    return grade;
  }

  // Crea una calificación semestral manualmente
  async create(dto: CreateSemesterGradeDto) {
    const student = await this.studentsRepository.findOne({ where: { id: dto.studentId } });
    if (!student) throw new NotFoundException('Estudiante no encontrado.');

    const subject = await this.subjectsRepository.findOne({ where: { id: dto.subjectId } });
    if (!subject) throw new NotFoundException('Materia no encontrada.');

    const config = await this.semesterConfigsRepository.findOne({ where: { id: dto.semesterConfigId } });
    if (!config) throw new NotFoundException('SemesterConfig no encontrado.');

    // Verificar que no exista una calificación para el mismo alumno + config
    const existing = await this.semesterGradesRepository.findOne({
      where: { studentId: dto.studentId, semesterConfigId: dto.semesterConfigId },
    });
    if (existing) throw new BadRequestException('Ya existe una calificación semestral para este alumno en esta configuración.');

    const grade = this.semesterGradesRepository.create(dto);
    return await this.semesterGradesRepository.save(grade);
  }

  // Calcula la nota semestral del alumno promediando sus 3 parciales
  // partialsAverage = (parcial1 + parcial2 + parcial3) / 3
  async calculate(studentId: string, subjectId: string, semesterConfigId: string) {
    const student = await this.studentsRepository.findOne({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Estudiante no encontrado.');

    const subject = await this.subjectsRepository.findOne({ where: { id: subjectId } });
    if (!subject) throw new NotFoundException('Materia no encontrada.');

    // Buscar todas las partialGrades del alumno en esta materia
    const partialGrades = await this.partialGradesRepository.find({
      where: { studentId, subjectId },
      relations: { partialConfig: true },
    });

    if (partialGrades.length === 0) {
      throw new BadRequestException('No hay calificaciones parciales para este alumno en esta materia.');
    }

    // Sumar los totales de cada parcial y promediar
    let sum = 0;
    let count = 0;
    for (const pg of partialGrades) {
      if (pg.total) {
        sum += parseFloat(pg.total);
        count++;
      }
    }

    if (count === 0) {
      throw new BadRequestException('Los parciales no tienen calificación.');
    }

    const partialsAverage = (sum / count).toFixed(2);

    // Buscar o crear la calificación semestral
    let grade = await this.semesterGradesRepository.findOne({
      where: { studentId, semesterConfigId },
    });

    if (grade) {
      grade.projectScore = partialsAverage;
      grade.total = partialsAverage;
    } else {
      grade = this.semesterGradesRepository.create({
        studentId,
        subjectId,
        semesterConfigId,
        projectScore: partialsAverage,
        total: partialsAverage,
      });
    }

    return await this.semesterGradesRepository.save(grade);
  }

  // Actualiza una calificación semestral
  async update(id: string, dto: UpdateSemesterGradeDto) {
    const grade = await this.findOne(id);
    Object.assign(grade, dto);
    return await this.semesterGradesRepository.save(grade);
  }

  // Elimina una calificación semestral
  async remove(id: string) {
    const grade = await this.findOne(id);
    await this.semesterGradesRepository.remove(grade);
    return { message: 'Calificación semestral eliminada correctamente.' };
  }
}
