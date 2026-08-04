import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alerts } from './Alerts';
import { Students } from '../users/Students';
import { Parents } from '../users/Parents';
import { CreateAlertDto, UpdateAlertDto } from './dto/alerts.dto';

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

  findAll() {
    return this.alertsRepo.find({
      relations: { student: { user: true }, parent: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const alert = await this.alertsRepo.findOne({
      where: { id },
      relations: { student: { user: true }, parent: true },
    });
    if (!alert) throw new NotFoundException('Alerta no encontrada.');
    return alert;
  }

  findByStudent(studentId: string, unreadOnly?: boolean) {
    const where: any = { studentId };
    if (unreadOnly) where.isRead = false;
    return this.alertsRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  findByParent(parentId: string, unreadOnly?: boolean) {
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

  async update(id: string, dto: UpdateAlertDto) {
    const alert = await this.findOne(id);
    if (dto.isRead !== undefined) {
      alert.isRead = dto.isRead;
      alert.readAt = dto.isRead ? new Date() : null;
    }
    if (dto.metadata !== undefined) alert.metadata = dto.metadata;
    return this.alertsRepo.save(alert);
  }

  async markAsRead(id: string) {
    const alert = await this.findOne(id);
    alert.isRead = true;
    alert.readAt = new Date();
    return this.alertsRepo.save(alert);
  }

  async remove(id: string) {
    const alert = await this.findOne(id);
    await this.alertsRepo.remove(alert);
    return { message: 'Alerta eliminada.' };
  }
}