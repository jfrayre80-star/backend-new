import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FocusLossLogs } from './FocusLossLogs';
import { ExamAttempts } from './ExamAttempts';
import { Exams } from './Exams';
import { CreateFocusLossLogDto } from './dto/create-focus-loss-log.dto';
import { UpdateFocusLossLogDto } from './dto/update-focus-loss-log.dto';

@Injectable()
export class FocusLossLogsService {
  constructor(
    @InjectRepository(FocusLossLogs)
    private readonly focusLossRepository: Repository<FocusLossLogs>,
    @InjectRepository(ExamAttempts)
    private readonly attemptsRepository: Repository<ExamAttempts>,
    @InjectRepository(Exams)
    private readonly examsRepository: Repository<Exams>,
  ) {}

  async findAll() {
    return await this.focusLossRepository.find({
      relations: { attempt: true },
    });
  }

  async findOne(id: string) {
    const log = await this.focusLossRepository.findOne({
      where: { id },
      relations: { attempt: true },
    });
    if (!log) throw new NotFoundException('FocusLossLog no encontrado.');
    return log;
  }

  async create(dto: CreateFocusLossLogDto) {
    const attempt = await this.attemptsRepository.findOne({ where: { id: dto.attemptId } });
    if (!attempt) throw new NotFoundException('Intento no encontrado.');

    const log = this.focusLossRepository.create(dto);
    const saved = await this.focusLossRepository.save(log);

    attempt.focusLossCount = (attempt.focusLossCount || 0) + 1;

    const exam = await this.examsRepository.findOne({ where: { id: attempt.examId } });
    if (exam && attempt.focusLossCount > (exam.maxFocusLosses || 3)) {
      attempt.status = 'closed';
      attempt.completedAt = new Date();
    }

    await this.attemptsRepository.save(attempt);

    return saved;
  }

  async update(id: string, dto: UpdateFocusLossLogDto) {
    const log = await this.findOne(id);
    Object.assign(log, dto);
    return await this.focusLossRepository.save(log);
  }

  async remove(id: string) {
    const log = await this.findOne(id);
    await this.focusLossRepository.remove(log);
    return { message: 'FocusLossLog eliminado correctamente.' };
  }
}
