import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamAnswers } from './ExamAnswers';
import { ExamAttempts } from './ExamAttempts';
import { ExamQuestions } from './ExamQuestions';
import { CreateExamAnswerDto } from './dto/create-exam-answer.dto';
import { UpdateExamAnswerDto } from './dto/update-exam-answer.dto';

@Injectable()
export class ExamAnswersService {
  constructor(
    @InjectRepository(ExamAnswers)
    private readonly answersRepository: Repository<ExamAnswers>,
    @InjectRepository(ExamAttempts)
    private readonly attemptsRepository: Repository<ExamAttempts>,
    @InjectRepository(ExamQuestions)
    private readonly questionsRepository: Repository<ExamQuestions>,
  ) {}

  async findAll() {
    return await this.answersRepository.find({
      relations: { attempt: true, question: true },
    });
  }

  async findOne(id: string) {
    const answer = await this.answersRepository.findOne({
      where: { id },
      relations: { attempt: true, question: true },
    });
    if (!answer) throw new NotFoundException('Respuesta no encontrada.');
    return answer;
  }

  // Guarda o actualiza la respuesta del alumno (auto-save durante el examen)
  async createOrUpdate(dto: CreateExamAnswerDto) {
    const attempt = await this.attemptsRepository.findOne({ where: { id: dto.attemptId } });
    if (!attempt) throw new NotFoundException('Intento no encontrado.');

    const question = await this.questionsRepository.findOne({ where: { id: dto.questionId } });
    if (!question) throw new NotFoundException('Pregunta no encontrada.');

    // Verificar si ya existe una respuesta para esta pregunta en este intento
    const existing = await this.answersRepository.findOne({
      where: { attemptId: dto.attemptId, questionId: dto.questionId },
    });

    if (existing) {
      // Actualizar respuesta existente (auto-save)
      Object.assign(existing, dto);
      existing.savedAt = new Date();
      return await this.answersRepository.save(existing);
    }

    // Crear nueva respuesta
    const answer = this.answersRepository.create(dto);
    return await this.answersRepository.save(answer);
  }

  // Calificación automática para preguntas de opción múltiple
  async autoGrade(attemptId: string) {
    const attempt = await this.attemptsRepository.findOne({ where: { id: attemptId } });
    if (!attempt) throw new NotFoundException('Intento no encontrado.');

    const answers = await this.answersRepository.find({
      where: { attemptId },
      relations: { question: true },
    });

    let totalScore = 0;

    for (const answer of answers) {
      if (answer.question.questionType === 'multiple_choice' && answer.question.correctOptions) {
        const correct = answer.question.correctOptions as string[];
        const selected = answer.selectedOptionLabel;

        if (selected && correct.includes(selected)) {
          answer.isCorrect = true;
          answer.score = answer.question.points;
          totalScore += parseFloat(answer.question.points);
        } else {
          answer.isCorrect = false;
          answer.score = '0';
        }

        await this.answersRepository.save(answer);
      }
    }

    // Actualizar el auto_score del intento
    attempt.autoScore = totalScore.toFixed(2);
    attempt.isAutoGraded = true;
    await this.attemptsRepository.save(attempt);

    return { autoScore: totalScore.toFixed(2), gradedAnswers: answers.length };
  }

  async update(id: string, dto: UpdateExamAnswerDto) {
    const answer = await this.findOne(id);
    Object.assign(answer, dto);
    return await this.answersRepository.save(answer);
  }

  async remove(id: string) {
    const answer = await this.findOne(id);
    await this.answersRepository.remove(answer);
    return { message: 'Respuesta eliminada correctamente.' };
  }
}
