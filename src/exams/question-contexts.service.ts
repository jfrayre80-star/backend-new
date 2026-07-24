import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionContexts } from './QuestionContexts';
import { Exams } from './Exams';
import { CreateQuestionContextDto } from './dto/create-question-context.dto';
import { UpdateQuestionContextDto } from './dto/update-question-context.dto';

@Injectable()
export class QuestionContextsService {
  constructor(
    @InjectRepository(QuestionContexts)
    private readonly contextsRepository: Repository<QuestionContexts>,
    @InjectRepository(Exams)
    private readonly examsRepository: Repository<Exams>,
  ) {}

  async findAll() {
    return await this.contextsRepository.find({
      relations: { exam: true },
    });
  }

  async findOne(id: string) {
    const context = await this.contextsRepository.findOne({
      where: { id },
      relations: { exam: true, examQuestions: true },
    });
    if (!context) throw new NotFoundException('Contexto de pregunta no encontrado.');
    return context;
  }

  async create(dto: CreateQuestionContextDto) {
    const exam = await this.examsRepository.findOne({ where: { id: dto.examId } });
    if (!exam) throw new NotFoundException('Examen no encontrado.');

    const context = this.contextsRepository.create(dto);
    return await this.contextsRepository.save(context);
  }

  async update(id: string, dto: UpdateQuestionContextDto) {
    const context = await this.findOne(id);
    Object.assign(context, dto);
    return await this.contextsRepository.save(context);
  }

  async remove(id: string) {
    const context = await this.findOne(id);
    await this.contextsRepository.remove(context);
    return { message: 'Contexto eliminado correctamente.' };
  }
}
