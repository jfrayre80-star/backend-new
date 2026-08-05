import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OfflineOperations } from './OfflineOperations';
import { CreateOfflineOperationDto, UpdateOfflineOperationDto } from './dto/offline-operations.dto';
import { SyncQueueService } from './sync-queue.service';

@Injectable()
export class OfflineOperationsService {
  constructor(
    @InjectRepository(OfflineOperations)
    private readonly offlineRepo: Repository<OfflineOperations>,
    private readonly syncQueueService: SyncQueueService,
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

  async create(dto: CreateOfflineOperationDto) {
    const existing = await this.offlineRepo.findOne({
      where: { localId: dto.localId, entityType: dto.entityType },
    });
    if (existing) {
      throw new ConflictException('Ya existe una operación con ese localId y entityType.');
    }
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

  async sync(dto: CreateOfflineOperationDto, userId: string) {
    const existing = await this.offlineRepo.findOne({
      where: { localId: dto.localId, entityType: dto.entityType },
    });

    if (existing && existing.syncedAt) {
      return {
        success: true,
        message: 'Operación ya sincronizada (duplicado ignorado).',
        offlineId: existing.id,
      };
    }

    let offline = existing;
    if (!offline) {
      offline = this.offlineRepo.create({
        localId: dto.localId,
        entityType: dto.entityType,
        operationType: dto.operationType,
        payload: dto.payload,
        localTimestamp: new Date(dto.localTimestamp),
        user: userId ? { id: userId } : undefined,
        deviceId: dto.deviceId ?? null,
        status: 'pending',
        retryCount: 0,
      });
      await this.offlineRepo.save(offline);
    }

    const queued = await this.syncQueueService.create({
      entityType: dto.entityType,
      payload: { ...dto.payload, localId: dto.localId },
      status: 'pending',
      retryCount: 0,
      maxRetries: 3,
      deviceTerminalId: dto.deviceId,
    });

    const processed = await this.syncQueueService.process(queued.id);

    offline.status = processed.status === 'completed' ? 'completed' : 'failed';
    if (processed.status === 'completed') {
      offline.syncedAt = new Date();
    }
    await this.offlineRepo.save(offline);

    return {
      success: processed.status === 'completed',
      message:
        processed.status === 'completed'
          ? 'Operación sincronizada correctamente.'
          : 'Operación encolada; se reintentará automáticamente.',
      offlineId: offline.id,
      syncId: queued.id,
    };
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