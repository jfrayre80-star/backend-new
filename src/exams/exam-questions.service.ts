import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamQuestions } from './ExamQuestions';
import { Exams } from './Exams';
import { QuestionContexts } from './QuestionContexts';
import { CreateExamQuestionDto } from './dto/create-exam-question.dto';
import { UpdateExamQuestionDto } from './dto/update-exam-question.dto';

@Injectable()
export class ExamQuestionsService {
  constructor(
    @InjectRepository(ExamQuestions)
    private readonly questionsRepository: Repository<ExamQuestions>,
    @InjectRepository(Exams)
    private readonly examsRepository: Repository<Exams>,
    @InjectRepository(QuestionContexts)
    private readonly contextsRepository: Repository<QuestionContexts>,
  ) {}

  async findAll() {
    return await this.questionsRepository.find({
      relations: { exam: true, questionContext: true },
    });
  }

  async findOne(id: string) {
    const question = await this.questionsRepository.findOne({
      where: { id },
      relations: { exam: true, questionContext: true, examAnswers: true },
    });
    if (!question) throw new NotFoundException('Pregunta no encontrada.');
    return question;
  }

  // Crea una pregunta asociada a un examen
  async create(dto: CreateExamQuestionDto) {
    const exam = await this.examsRepository.findOne({ where: { id: dto.examId } });
    if (!exam) throw new NotFoundException('Examen no encontrado.');

    if (dto.questionContextId) {
      const context = await this.contextsRepository.findOne({ where: { id: dto.questionContextId } });
      if (!context) throw new NotFoundException('Contexto de pregunta no encontrado.');
    }

    const question = this.questionsRepository.create(dto);
    return await this.questionsRepository.save(question);
  }

  async update(id: string, dto: UpdateExamQuestionDto) {
    const question = await this.findOne(id);
    Object.assign(question, dto);
    return await this.questionsRepository.save(question);
  }

  async remove(id: string) {
    const question = await this.findOne(id);
    await this.questionsRepository.remove(question);
    return { message: 'Pregunta eliminada correctamente.' };
  }
}
