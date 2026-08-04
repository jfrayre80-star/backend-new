import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OfflineOperations } from './OfflineOperations';
import { CreateOfflineOperationDto, UpdateOfflineOperationDto } from './dto/offline-operations.dto';

@Injectable()
export class OfflineOperationsService {
  constructor(
    @InjectRepository(OfflineOperations)
    private readonly offlineRepo: Repository<OfflineOperations>,
  ) {}

  findAll(status?: string) {
    const where: any = {};
    if (status) where.status = status;
    return this.offlineRepo.find({
      where,
      relations: { user: true },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string) {
    const op = await this.offlineRepo.findOne({ where: { id }, relations: { user: true } });
    if (!op) throw new NotFoundException('Operación offline no encontrada.');
    return op;
  }

create(dto: CreateOfflineOperationDto) {
  return this.offlineRepo.save(
    this.offlineRepo.create({
      localId: dto.localId,
      entityType: dto.entityType,
      operationType: dto.operationType,
      payload: dto.payload,
      localTimestamp: new Date(dto.localTimestamp),
      user: dto.userId ? { id: dto.userId } : undefined,
      deviceId: dto.deviceId ?? null,
      status: 'pending',
      retryCount: 0,
    }),
  );
}

  async update(id: string, dto: UpdateOfflineOperationDto) {
    const op = await this.findOne(id);
    Object.assign(op, dto);
    return this.offlineRepo.save(op);
  }

  async markCompleted(id: string) {
    const op = await this.findOne(id);
    op.status = 'completed';
    op.syncedAt = new Date();
    return this.offlineRepo.save(op);
  }

  async remove(id: string) {
    const op = await this.findOne(id);
    await this.offlineRepo.remove(op);
    return { message: 'Operación offline eliminada.' };
  }
}