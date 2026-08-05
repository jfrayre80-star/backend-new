import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notices } from './Notices';
import { Users } from '../users/Users';
import { Groups } from '../academic/Groups';
import { CreateNoticeDto, UpdateNoticeDto } from './dto/notices.dto';

@Injectable()
export class NoticesService {
  constructor(
    @InjectRepository(Notices)
    private readonly noticesRepo: Repository<Notices>,
    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>,
    @InjectRepository(Groups)
    private readonly groupsRepo: Repository<Groups>,
  ) {}

  findAll(targetRole?: string) {
    const where: any = {};
    if (targetRole) where.targetRole = targetRole;
    return this.noticesRepo.find({
      where,
      relations: { createdBy: true, targetGroup: true },
      order: { publishedAt: 'DESC' },
    });
  }

  findAllGlobal() {
    return this.noticesRepo.find({
      where: { isGlobal: true },
      relations: { createdBy: true },
      order: { publishedAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const notice = await this.noticesRepo.findOne({
      where: { id },
      relations: { createdBy: true, targetGroup: true },
    });
    if (!notice) throw new NotFoundException('Aviso no encontrado.');
    return notice;
  }

  async create(dto: CreateNoticeDto) {
    const createdBy = await this.usersRepo.findOne({ where: { id: dto.createdById } });
    if (!createdBy) throw new NotFoundException('Usuario creador no encontrado.');

    let targetGroup: Groups | null = null;
    if (dto.targetGroupId) {
      targetGroup = await this.groupsRepo.findOne({ where: { id: dto.targetGroupId } });
      if (!targetGroup) throw new NotFoundException('Grupo objetivo no encontrado.');
    }

    const notice = this.noticesRepo.create({
      title: dto.title,
      content: dto.content,
      targetRole: dto.targetRole ?? null,
      isGlobal: dto.isGlobal ?? false,
      priority: dto.priority ?? 'normal',
      publishedAt: new Date(),
    });

    notice.createdBy = createdBy;
    if (targetGroup) notice.targetGroup = targetGroup;

    return this.noticesRepo.save(notice);
  }

  async update(id: string, dto: UpdateNoticeDto) {
    const notice = await this.findOne(id);

    if (dto.title !== undefined) notice.title = dto.title;
    if (dto.content !== undefined) notice.content = dto.content;
    if (dto.targetRole !== undefined) notice.targetRole = dto.targetRole;
    if (dto.isGlobal !== undefined) notice.isGlobal = dto.isGlobal;
    if (dto.priority !== undefined) notice.priority = dto.priority;

    if (dto.targetGroupId !== undefined) {
      if (dto.targetGroupId) {
        const targetGroup = await this.groupsRepo.findOne({ where: { id: dto.targetGroupId } });
        if (!targetGroup) throw new NotFoundException('Grupo objetivo no encontrado.');
        notice.targetGroup = targetGroup;
      } else {
        notice.targetGroup = null as any;
      }
    }

    return this.noticesRepo.save(notice);
  }

  async remove(id: string) {
    const notice = await this.findOne(id);
    await this.noticesRepo.remove(notice);
    return { message: 'Aviso eliminado.' };
  }
}