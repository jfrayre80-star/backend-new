import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SyncQueue } from './SyncQueue';
import { CreateSyncQueueDto, UpdateSyncQueueDto } from './dto/sync-queue.dto';

@Injectable()
export class SyncQueueService {
  constructor(
    @InjectRepository(SyncQueue)
    private readonly syncQueueRepo: Repository<SyncQueue>,
  ) {}

  findAll(status?: string) {
    const where: any = {};
    if (status) where.status = status;
    return this.syncQueueRepo.find({
      where,
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string) {
    const item = await this.syncQueueRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Elemento de sync no encontrado.');
    return item;
  }

  create(dto: CreateSyncQueueDto) {
    return this.syncQueueRepo.save(
      this.syncQueueRepo.create({
        entityType: dto.entityType,
        payload: dto.payload,
        status: dto.status ?? 'pending',
        retryCount: dto.retryCount ?? 0,
        maxRetries: dto.maxRetries ?? 3,
        errorMessage: dto.errorMessage ?? null,
        deviceTerminalId: dto.deviceTerminalId ?? null,
      }),
    );
  }

  async update(id: string, dto: UpdateSyncQueueDto) {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.syncQueueRepo.save(item);
  }

  async markCompleted(id: string) {
    const item = await this.findOne(id);
    item.status = 'completed';
    item.processedAt = new Date();
    item.errorMessage = null;
    return this.syncQueueRepo.save(item);
  }

  async markFailed(id: string, errorMessage: string) {
    const item = await this.findOne(id);
    item.status = 'failed';
    item.errorMessage = errorMessage;
    item.processedAt = new Date();
    return this.syncQueueRepo.save(item);
  }

  async retry(id: string) {
    const item = await this.findOne(id);
    if (item.status === 'completed') {
      throw new BadRequestException('No se puede reintentar un elemento ya completado.');
    }
    if ((item.retryCount ?? 0) >= (item.maxRetries ?? 3)) {
      throw new BadRequestException('Se alcanzó el máximo de reintentos.');
    }
    item.retryCount = (item.retryCount ?? 0) + 1;
    item.status = 'pending';
    item.errorMessage = null;
    item.processedAt = null;
    return this.syncQueueRepo.save(item);
  }

  async remove(id: string) {
    const item = await this.findOne(id);
    await this.syncQueueRepo.remove(item);
    return { message: 'Elemento de sync eliminado.' };
  }
}