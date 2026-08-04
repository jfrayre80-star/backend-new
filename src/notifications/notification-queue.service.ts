import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationQueue } from './NotificationQueue';
import { CreateNotificationQueueDto, UpdateNotificationQueueDto } from './dto/notification-queue.dto';

@Injectable()
export class NotificationQueueService {
  constructor(
    @InjectRepository(NotificationQueue)
    private readonly queueRepo: Repository<NotificationQueue>,
  ) {}

  findAll(status?: string) {
    const where: any = {};
    if (status) where.status = status;
    return this.queueRepo.find({
      where,
      order: { scheduledAt: 'ASC' },
    });
  }

  async findOne(id: string) {
    const item = await this.queueRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Notificación en cola no encontrada.');
    return item;
  }

  create(dto: CreateNotificationQueueDto) {
    return this.queueRepo.save(
      this.queueRepo.create({
        type: dto.type,
        payload: dto.payload,
        status: dto.status ?? 'pending',
        retryCount: 0,
        maxRetries: dto.maxRetries ?? 3,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : new Date(),
      }),
    );
  }

  async update(id: string, dto: UpdateNotificationQueueDto) {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.queueRepo.save(item);
  }

  async markCompleted(id: string) {
    const item = await this.findOne(id);
    item.status = 'completed';
    item.processedAt = new Date();
    item.errorMessage = null;
    return this.queueRepo.save(item);
  }

  async markFailed(id: string, errorMessage: string) {
    const item = await this.findOne(id);
    item.status = 'failed';
    item.errorMessage = errorMessage;
    item.processedAt = new Date();
    return this.queueRepo.save(item);
  }

  async retry(id: string) {
    const item = await this.findOne(id);
    if (item.status === 'completed') {
      throw new BadRequestException('No se puede reintentar una notificación completada.');
    }
    if ((item.retryCount ?? 0) >= (item.maxRetries ?? 3)) {
      throw new BadRequestException('Se alcanzó el máximo de reintentos.');
    }
    item.retryCount = (item.retryCount ?? 0) + 1;
    item.status = 'pending';
    item.errorMessage = null;
    item.processedAt = null;
    return this.queueRepo.save(item);
  }

  async remove(id: string) {
    const item = await this.findOne(id);
    await this.queueRepo.remove(item);
    return { message: 'Notificación de cola eliminada.' };
  }
}