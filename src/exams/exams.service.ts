import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exams } from './Exams';
import { Groups } from '../academic/Groups';
import { Subjects } from '../academic/Subjects';
import { Teachers } from '../users/Teachers';
import { Activities } from '../evaluation/Activities';
import { EvaluationSchemes } from '../evaluation/EvaluationSchemes';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';

@Injectable()
export class ExamsService {
  constructor(
    @InjectRepository(Exams)
    private readonly examsRepository: Repository<Exams>,
    @InjectRepository(Groups)
    private readonly groupsRepository: Repository<Groups>,
    @InjectRepository(Subjects)
    private readonly subjectsRepository: Repository<Subjects>,
    @InjectRepository(Teachers)
    private readonly teachersRepository: Repository<Teachers>,
    @InjectRepository(Activities)
    private readonly activitiesRepository: Repository<Activities>,
    @InjectRepository(EvaluationSchemes)
    private readonly evaluationSchemesRepository: Repository<EvaluationSchemes>,
  ) {}

  // Valida que exactamente uno de activityId o evaluationSchemeId esté presente (CHECK constraint de BD)
  private validateLinkage(dto: CreateExamDto | UpdateExamDto) {
    if (dto.activityId && dto.evaluationSchemeId) {
      throw new BadRequestException('Un examen no puede estar vinculado a una Activity y un EvaluationScheme al mismo tiempo.');
    }
    if (!dto.activityId && !dto.evaluationSchemeId) {
      throw new BadRequestException('Un examen debe estar vinculado a una Activity o un EvaluationScheme.');
    }
  }

  async findAll() {
    return await this.examsRepository.find({
      relations: { group: true, subject: true, teacher: true, activity: true, evaluationScheme: true },
    });
  }

  async findOne(id: string) {
    const exam = await this.examsRepository.findOne({
      where: { id },
      relations: { group: true, subject: true, teacher: true, activity: true, evaluationScheme: true, examQuestions: true, questionContexts: true },
    });
    if (!exam) throw new NotFoundException('Examen no encontrado.');
    return exam;
  }

  // Crea un examen validando FKs y el constraint de vinculación
  async create(dto: CreateExamDto) {
    this.validateLinkage(dto);

    const group = await this.groupsRepository.findOne({ where: { id: dto.groupId, isActive: true } });
    if (!group) throw new NotFoundException('Grupo no encontrado.');

    const subject = await this.subjectsRepository.findOne({ where: { id: dto.subjectId, isActive: true } });
    if (!subject) throw new NotFoundException('Materia no encontrada.');

    const teacher = await this.teachersRepository.findOne({ where: { id: dto.teacherId } });
    if (!teacher) throw new NotFoundException('Profesor no encontrado.');

    if (dto.activityId) {
      const activity = await this.activitiesRepository.findOne({ where: { id: dto.activityId } });
      if (!activity) throw new NotFoundException('Activity no encontrada.');
    }

    if (dto.evaluationSchemeId) {
      const scheme = await this.evaluationSchemesRepository.findOne({ where: { id: dto.evaluationSchemeId } });
      if (!scheme) throw new NotFoundException('EvaluationScheme no encontrado.');
    }

    const exam = this.examsRepository.create(dto);
    return await this.examsRepository.save(exam);
  }

  async update(id: string, dto: UpdateExamDto) {
    const exam = await this.findOne(id);

    // Si cambia la vinculación, revalidar
    if (dto.activityId !== undefined || dto.evaluationSchemeId !== undefined) {
      const merged = { ...exam, ...dto };
      if (merged.activityId && merged.evaluationSchemeId) {
        throw new BadRequestException('Un examen no puede estar vinculado a ambos.');
      }
      if (!merged.activityId && !merged.evaluationSchemeId) {
        throw new BadRequestException('Un examen debe estar vinculado a uno.');
      }
    }

    Object.assign(exam, dto);
    return await this.examsRepository.save(exam);
  }

  async remove(id: string) {
    const exam = await this.findOne(id);
    await this.examsRepository.remove(exam);
    return { message: 'Examen eliminado correctamente.' };
  }
}
