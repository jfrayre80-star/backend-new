import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamQuestions } from './ExamQuestions';
import { Exams } from './Exams';
import { QuestionContexts } from './QuestionContexts';
import { CreateExamQuestionDto } from './dto/create-exam-question.dto';
import { UpdateExamQuestionDto } from './dto/update-exam-question.dto';

// RF-34: límite institucional de preguntas por examen según la categoría.
const QUESTION_LIMITS: Record<Exams['examCategory'], number> = {
  partial: 30,
  semestral: 50,
  extraordinary: 50,
};

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

  // Crea una pregunta asociada a un examen validando el límite por categoría (RF-34)
  async create(dto: CreateExamQuestionDto) {
    const exam = await this.examsRepository.findOne({ where: { id: dto.examId } });
    if (!exam) throw new NotFoundException('Examen no encontrado.');

    if (dto.questionContextId) {
      const context = await this.contextsRepository.findOne({ where: { id: dto.questionContextId } });
      if (!context) throw new NotFoundException('Contexto de pregunta no encontrado.');
    }

    const currentCount = await this.questionsRepository.count({
      where: { examId: dto.examId },
    });
    const maxQuestions = QUESTION_LIMITS[exam.examCategory] ?? 50;

    if (currentCount >= maxQuestions) {
      throw new BadRequestException(
        `El examen no puede tener más de ${maxQuestions} preguntas.`,
      );
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
