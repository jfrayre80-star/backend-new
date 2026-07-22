import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { randomBytes } from "crypto";

import { Schedules } from "../academic/Schedules";
import { QrCodes } from "./QrCodes";
import { StartAttendanceDto } from "./dto/start-attendance.dto";

const QR_EXPIRATION_TIME = 30 * 1000;

@Injectable()
export class AttendanceService {

  constructor(

    @InjectRepository(Schedules)
    private readonly schedulesRepository: Repository<Schedules>,

    @InjectRepository(QrCodes)
    private readonly qrCodesRepository: Repository<QrCodes>,

  ) {}

  async start(dto: StartAttendanceDto) {

    const schedule = await this.findActiveSchedule(dto.scheduleId);

    if (!schedule.teacher) {
      throw new ConflictException(
        "El horario no tiene un profesor asignado.",
      );
    }

    const activeQr = await this.findActiveQr(dto.scheduleId);

    if (activeQr && activeQr.expiresAt > new Date()) {
      throw new ConflictException(
        "Ya existe un código QR activo para este horario y aún no ha caducado.",
      );
    }

    if (activeQr) {
      activeQr.isActive = false;
      await this.qrCodesRepository.save(activeQr);
    }

    const qr = this.qrCodesRepository.create({
      hashValue: this.generateQrHash(),
      schedule,
      teacher: schedule.teacher,
      expiresAt: new Date(
        Date.now() + QR_EXPIRATION_TIME,
      ),
      isActive: true,
    });

    await this.qrCodesRepository.save(qr);

    return {
      message: "QR generado exitosamente.",
      qrId: qr.id,
      scheduleId: schedule.id,
      hash: qr.hashValue,
      expiresAt: qr.expiresAt,
    };
  }

  private generateQrHash(): string {
    return randomBytes(32).toString("hex");
  }

  private async findActiveSchedule(scheduleId: string,): Promise<Schedules> {

    const schedule =
      await this.schedulesRepository.findOne({
        where: {
          id: scheduleId,
          isActive: true,
        },
        relations: {
          teacher: true,
        },
      });

    if (!schedule) {
      throw new NotFoundException(
        "Horario no encontrado o inactivo.",
      );
    }
    return schedule;
  }

  private async findActiveQr(scheduleId: string,): Promise<QrCodes | null> {

    return this.qrCodesRepository.findOne({
      where: {
        schedule: {
          id: scheduleId,
        },
        isActive: true,
      },
      order: {
        createdAt: "DESC",
      },
    });
  }



}