import {ConflictException, Injectable, NotFoundException, BadRequestException} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { randomBytes } from "crypto";
import { Schedules } from "../academic/Schedules";
import { QrCodes } from "./QrCodes";
import { StartAttendanceDto } from "./dto/start-attendance.dto";
import {Students} from "../users/Students";
import {ScanQrDto} from "./dto/start-attendance.dto";
import {AttendanceRecords} from "./AttendanceRecords";

const QR_EXPIRATION_TIME = 30 * 1000;
const LATE_TOLERANCE_MINUTES = 10;
@Injectable()
export class AttendanceService {

  constructor(

    @InjectRepository(Schedules)
    private readonly schedulesRepository: Repository<Schedules>,

    @InjectRepository(QrCodes)
    private readonly qrCodesRepository: Repository<QrCodes>,

    @InjectRepository(Students)
    private readonly studentsRepository: Repository<Students>,

    @InjectRepository(AttendanceRecords)
    private readonly attendanceRecordsRepository: Repository<AttendanceRecords>,
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

async scanQr(studentId: string, dto: ScanQrDto) {

const student = await this.studentsRepository.findOne({
  where: {userId:studentId},
});

if (!student) {
  throw new NotFoundException("Estudiante no encontrado.");
}

const qr= await this.qrCodesRepository.findOne({
  where: {hashValue:dto.qrHash, isActive:true},
  relations: {schedule:true},
});

if (!qr || qr.expiresAt < new Date()) {
  throw new BadRequestException("El código QR no es válido o ha caducado.");
}

const scheduleId = qr.schedule.id;
const today = new Date().toISOString().split("T")[0];

const existingRecord = await this.attendanceRecordsRepository.findOne({
where : {studentId: student.id, scheduleId, recordedDate: today},
});

if (existingRecord) {
  throw new ConflictException("El estudiante ya ha registrado asistencia para este horario hoy.");
}

const qrCreatedAt = qr.createdAt ? new Date(qr.createdAt).getTime() : Date.now();
const diffMinutes = (Date.now() - qrCreatedAt) / (1000 * 60);

const status: 'present' | 'late' = diffMinutes > LATE_TOLERANCE_MINUTES ? 'late' : 'present';

const record = this.attendanceRecordsRepository.create({
  studentId: student.id,
  scheduleId,
  status,
  qrHash: dto.qrHash,
  scanTimestamp: new Date(),
  recordedDate: today,
});

await this.attendanceRecordsRepository.save(record);

return {
  message: "Asistencia registrada exitosamente.",
  studentId: student.id,
  scheduleId,
}
}
}
