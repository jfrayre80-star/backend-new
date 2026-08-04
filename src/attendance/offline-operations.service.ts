import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OfflineOperations } from './OfflineOperations';
import { AccessLogs } from './AccessLogs';
import { CreateOfflineOperationDto, UpdateOfflineOperationDto } from './dto/offline-operations.dto';
import { SyncQueueService } from './sync-queue.service';

@Injectable()
export class OfflineOperationsService {
  constructor(
    @InjectRepository(OfflineOperations)
    private readonly offlineRepo: Repository<OfflineOperations>,
    @InjectRepository(AccessLogs)
    private readonly accessLogsRepository: Repository<AccessLogs>,
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
  } else {
    offline.status = 'pending';
    offline.payload = dto.payload;
  }
  await this.offlineRepo.save(offline);

  const queued = await this.syncQueueService.create({
    entityType: dto.entityType,
    payload: { ...dto.payload, localId: dto.localId },
    status: 'pending',
    retryCount: 0,
    maxRetries: 3,
    deviceTerminalId: dto.deviceId,
  });

  return { success: true, message: 'Operación encolada para sincronización.', offlineId: offline.id, syncId: queued.id };
}

async process(id: string) {
  const item = await this.findOne(id);
  if (item.status === 'completed') return item;

  item.status = 'processing';
  await this.offlineRepo.save(item);

  try {
    await this.dispatch(item.entityType, item.payload as any);
    item.status = 'completed';
  } catch (error) {
    item.status = 'failed';
    await this.offlineRepo.save(item);
    throw error;
  }

  return this.offlineRepo.save(item);
}

private async dispatch(entityType: string, payload: any): Promise<void> {
  switch (entityType) {
    case 'access_log':
      await this.accessLogsRepository.save(
        this.accessLogsRepository.create({
          studentId: payload.studentId,
          eventType: payload.eventType,
          scannedAt: payload.scannedAt ? new Date(payload.scannedAt) : new Date(),
          deviceTerminalId: payload.deviceTerminalId ?? null,
          isExitReturn: payload.isExitReturn ?? false,
          isSynced: true,
          syncedAt: new Date(),
        }),
      );
      return;
    default:
      throw new Error(`No hay handler para el entityType: ${entityType}`);
  }
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