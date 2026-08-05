import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alerts } from './Alerts';
import { Students } from '../users/Students';
import { Parents } from '../users/Parents';
import { CreateAlertDto, UpdateAlertDto } from './dto/alerts.dto';

type CurrentUser = { id: string; role: string };

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alerts)
    private readonly alertsRepo: Repository<Alerts>,
    @InjectRepository(Students)
    private readonly studentsRepo: Repository<Students>,
    @InjectRepository(Parents)
    private readonly parentsRepo: Repository<Parents>,
  ) {}

  private async assertCanAccessStudent(studentId: string, currentUser: CurrentUser) {
    if (currentUser.role === 'admin') return;
    if (currentUser.role === 'parent') {
      const parent = await this.parentsRepo.findOne({ where: { user: { id: currentUser.id } } });
      if (!parent) throw new ForbiddenException('Acceso denegado. No se encontró registro de padre vinculado.');
      const child = await this.studentsRepo.findOne({ where: { id: studentId, parentId: parent.id } });
      if (!child) throw new ForbiddenException('Acceso denegado. Este alumno no está vinculado a tu cuenta.');
      return;
    }
    if (currentUser.role === 'student') {
      const student = await this.studentsRepo.findOne({ where: { userId: currentUser.id } });
      if (!student || student.id !== studentId) {
        throw new ForbiddenException('Solo puedes consultar tus propias alertas.');
      }
      return;
    }
    throw new ForbiddenException('Acceso denegado.');
  }

  findAll() {
    return this.alertsRepo.find({
      relations: { student: { user: true }, parent: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, currentUser: CurrentUser) {
    const alert = await this.alertsRepo.findOne({
      where: { id },
      relations: { student: { user: true }, parent: true },
    });
    if (!alert) throw new NotFoundException('Alerta no encontrada.');
    await this.assertCanAccessStudent(alert.studentId, currentUser);
    return alert;
  }

  async findByStudent(studentId: string, currentUser: CurrentUser, unreadOnly?: boolean) {
    await this.assertCanAccessStudent(studentId, currentUser);
    const where: any = { studentId };
    if (unreadOnly) where.isRead = false;
    return this.alertsRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findByParent(parentId: string, currentUser: CurrentUser, unreadOnly?: boolean) {
    if (currentUser.role === 'parent') {
      const parent = await this.parentsRepo.findOne({ where: { user: { id: currentUser.id } } });
      if (!parent || parent.id !== parentId) {
        throw new ForbiddenException('Solo puedes consultar tus propias alertas.');
      }
    }
    const where: any = { parentId };
    if (unreadOnly) where.isRead = false;
    return this.alertsRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async create(dto: CreateAlertDto) {
    const student = await this.studentsRepo.findOne({ where: { id: dto.studentId } });
    if (!student) throw new NotFoundException('Alumno no encontrado.');

    const parent = await this.parentsRepo.findOne({ where: { id: dto.parentId } });
    if (!parent) throw new NotFoundException('Padre no encontrado.');

    if (student.parentId !== parent.id) {
      throw new BadRequestException('El padre no corresponde al alumno seleccionado.');
    }

    const alert = this.alertsRepo.create({
      studentId: dto.studentId,
      parentId: dto.parentId,
      alertType: dto.alertType,
      title: dto.title,
      message: dto.message,
      isRead: false,
      metadata: dto.metadata ?? null,
    });

    alert.student = student;
    alert.parent = parent;

    return this.alertsRepo.save(alert);
  }

  async update(id: string, dto: UpdateAlertDto, currentUser: CurrentUser) {
    const alert = await this.findOne(id, currentUser);
    if (dto.isRead !== undefined) {
      alert.isRead = dto.isRead;
      alert.readAt = dto.isRead ? new Date() : null;
    }
    if (dto.metadata !== undefined) alert.metadata = dto.metadata;
    return this.alertsRepo.save(alert);
  }

  async markAsRead(id: string, currentUser: CurrentUser) {
    const alert = await this.findOne(id, currentUser);
    alert.isRead = true;
    alert.readAt = new Date();
    return this.alertsRepo.save(alert);
  }

  async remove(id: string, currentUser: CurrentUser) {
    const alert = await this.findOne(id, currentUser);
    await this.alertsRepo.remove(alert);
    return { message: 'Alerta eliminada.' };
  }
}