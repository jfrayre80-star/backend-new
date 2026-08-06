import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActiveSessions } from './ActiveSessions';
import { CreateActiveSessionDto, UpdateActiveSessionDto } from './dto/active-sessions.dto';

@Injectable()
export class ActiveSessionsService {
  constructor(
    @InjectRepository(ActiveSessions) private readonly sessionRepo: Repository<ActiveSessions>,
  ) {}

  findAll(): Promise<ActiveSessions[]> {
    return this.sessionRepo.find({ relations: { user: true }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<ActiveSessions> {
    const s = await this.sessionRepo.findOne({ where: { id }, relations: { user: true } });
    if (!s) throw new NotFoundException(`Sesión ${id} no encontrada`);
    return s;
  }

  findActiveByUser(userId: string): Promise<ActiveSessions[]> {
    return this.sessionRepo.find({ where: { userId, isActive: true }, order: { createdAt: 'DESC' } });
  }

  async create(dto: CreateActiveSessionDto): Promise<ActiveSessions> {
    return this.sessionRepo.save(this.sessionRepo.create({
      userId: dto.userId,
      deviceId: dto.deviceId,
      tokenHash: dto.tokenHash,
      ipAddress: dto.ipAddress ?? null,
      userAgent: dto.userAgent ?? null,
      expiresAt: new Date(dto.expiresAt),
    }));
  }

  async register(
    userId: string,
    deviceId: string,
    tokenHash: string,
    ipAddress: string | null,
    userAgent: string | null,
    expiresAt: Date,
  ): Promise<ActiveSessions> {
    let session = await this.sessionRepo.findOne({ where: { userId, deviceId } });
    if (!session) {
      session = this.sessionRepo.create({
        userId,
        deviceId,
        tokenHash,
        ipAddress,
        userAgent,
        expiresAt,
      });
    } else {
      session.tokenHash = tokenHash;
      session.ipAddress = ipAddress;
      session.userAgent = userAgent;
      session.expiresAt = expiresAt;
      session.isActive = true;
    }
    return this.sessionRepo.save(session);
  }

  async deactivate(id: string): Promise<ActiveSessions> {
    const session = await this.findOne(id);
    session.isActive = false;
    return this.sessionRepo.save(session);
  }

  async deactivateAllByUser(userId: string): Promise<void> {
    await this.sessionRepo.update({ userId, isActive: true }, { isActive: false });
  }

  async remove(id: string): Promise<void> {
    const session = await this.findOne(id);
    await this.sessionRepo.remove(session);
  }

  async cleanExpired(): Promise<number> {
    const result = await this.sessionRepo
      .createQueryBuilder()
      .update()
      .set({ isActive: false })
      .where('expires_at < :now', { now: new Date() })
      .andWhere('is_active = true')
      .execute();
    return result.affected ?? 0;
  }
}
