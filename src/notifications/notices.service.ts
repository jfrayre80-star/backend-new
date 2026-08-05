import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Notices } from './Notices';
import { Users } from '../users/Users';
import { Groups } from '../academic/Groups';
import { Students } from '../users/Students';
import { Parents } from '../users/Parents';
import { Teachers } from '../users/Teachers';
import { GroupEnrollments } from '../academic/GroupEnrollments';
import { Schedules } from '../academic/Schedules';
import { CreateNoticeDto, UpdateNoticeDto } from './dto/notices.dto';

type CurrentUser = { id: string; role: string };

@Injectable()
export class NoticesService {
  constructor(
    @InjectRepository(Notices)
    private readonly noticesRepo: Repository<Notices>,
    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>,
    @InjectRepository(Groups)
    private readonly groupsRepo: Repository<Groups>,
    @InjectRepository(Students)
    private readonly studentsRepo: Repository<Students>,
    @InjectRepository(Parents)
    private readonly parentsRepo: Repository<Parents>,
    @InjectRepository(Teachers)
    private readonly teachersRepo: Repository<Teachers>,
    @InjectRepository(GroupEnrollments)
    private readonly enrollmentsRepo: Repository<GroupEnrollments>,
    @InjectRepository(Schedules)
    private readonly schedulesRepo: Repository<Schedules>,
  ) {}

  private async getUserGroupIds(currentUser: CurrentUser): Promise<string[]> {
    if (currentUser.role === 'admin') return [];
    if (currentUser.role === 'student') {
      const student = await this.studentsRepo.findOne({ where: { userId: currentUser.id } });
      if (!student) return [];
      const enrollments = await this.enrollmentsRepo.find({ where: { studentId: student.id } });
      return enrollments.map((e) => e.groupId);
    }
    if (currentUser.role === 'parent') {
      const parent = await this.parentsRepo.findOne({ where: { user: { id: currentUser.id } } });
      if (!parent) return [];
      const children = await this.studentsRepo.find({ where: { parentId: parent.id } });
      const childIds = children.map((c) => c.id);
      if (childIds.length === 0) return [];
      const enrollments = await this.enrollmentsRepo.find({ where: { studentId: In(childIds) } });
      return [...new Set(enrollments.map((e) => e.groupId))];
    }
    if (currentUser.role === 'teacher') {
      const teacher = await this.teachersRepo.findOne({ where: { user: { id: currentUser.id } } });
      if (!teacher) return [];
      const schedules = await this.schedulesRepo.find({ where: { teacherId: teacher.id } });
      return [...new Set(schedules.map((s) => s.groupId))];
    }
    return [];
  }

  private canView(notice: Notices, currentUser: CurrentUser, ownGroupIds: string[]): boolean {
    if (currentUser.role === 'admin') return true;
    if (notice.isGlobal) return true;
    if (notice.targetRole && notice.targetRole !== currentUser.role) return false;
    if (notice.targetGroup && !ownGroupIds.includes(notice.targetGroup.id)) return false;
    return true;
  }

  async findAll(currentUser: CurrentUser, targetRole?: string) {
    const notices = await this.noticesRepo.find({
      where: targetRole ? ({ targetRole } as any) : {},
      relations: { createdBy: true, targetGroup: true },
      order: { publishedAt: 'DESC' },
    });
    const ownGroupIds = await this.getUserGroupIds(currentUser);
    return notices.filter((n) => this.canView(n, currentUser, ownGroupIds));
  }

  async findAllGlobal(currentUser: CurrentUser) {
    const notices = await this.noticesRepo.find({
      where: { isGlobal: true },
      relations: { createdBy: true },
      order: { publishedAt: 'DESC' },
    });
    const ownGroupIds = await this.getUserGroupIds(currentUser);
    return notices.filter((n) => this.canView(n, currentUser, ownGroupIds));
  }

  async findOne(id: string, currentUser: CurrentUser) {
    const notice = await this.noticesRepo.findOne({
      where: { id },
      relations: { createdBy: true, targetGroup: true },
    });
    if (!notice) throw new NotFoundException('Aviso no encontrado.');
    const ownGroupIds = await this.getUserGroupIds(currentUser);
    if (!this.canView(notice, currentUser, ownGroupIds)) {
      throw new ForbiddenException('No tienes permiso para ver este aviso.');
    }
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
    const notice = await this.findOne(id, { id: '', role: 'admin' });

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
    const notice = await this.findOne(id, { id: '', role: 'admin' });
    await this.noticesRepo.remove(notice);
    return { message: 'Aviso eliminado.' };
  }
}