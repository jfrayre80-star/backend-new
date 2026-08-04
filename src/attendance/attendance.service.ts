import {ConflictException, Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository, DataSource } from "typeorm";
import { randomBytes } from "crypto";
import { Schedules } from "../academic/Schedules";
import { QrCodes } from "./QrCodes";
import { StartAttendanceDto } from "./dto/start-attendance.dto";
import { Students } from "../users/Students";
import { ScanQrDto } from "./dto/scan-qr.dto";
import { AttendanceRecords } from "./AttendanceRecords";
import { Justifications } from "./Justifications";
import { CreateJustificationDto } from "./dto/create-justification.dto";
import { AccessLogs } from "./AccessLogs";
import { CreateAccessLogDto } from "./dto/create-access-log.dto";
import { UpdateJustificationDto } from "./dto/update-justification.dto";
import { GroupEnrollments } from "../academic/GroupEnrollments";
import { ManualAttendanceDto } from "./dto/manual-attendance.dto";
import { Parents } from '../users/Parents';


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

    @InjectRepository(Justifications)
    private readonly justificationsRepository: Repository<Justifications>,

    @InjectRepository(GroupEnrollments)
    private readonly groupEnrollmentRepo: Repository<GroupEnrollments>,

    @InjectRepository(AccessLogs)
    private readonly accessLogsRepository: Repository<AccessLogs>,
    
    @InjectRepository(Parents)
    private readonly parentsRepository: Repository<Parents>,

    private readonly dataSource: DataSource,
  ) {}
//para encontrar el schedule activo
    private async findActiveSchedule(scheduleId: string): Promise<Schedules> {
  const schedule = await this.schedulesRepository.findOne({
    where: { 
      id: scheduleId, 
      isActive: true 
    },
    relations: { 
      teacher: true,
      subject: true,
    },
  });

  if (!schedule) {
    throw new NotFoundException(
      "El horario especificado no existe o se encuentra inactivo.",
    );
  }

  return schedule;
}
  //encontrar solo los qr activos 
private async findActiveQr(scheduleId: string): Promise<QrCodes | null> {
  return this.qrCodesRepository.findOne({
    where: {
      schedule: { id: scheduleId },
      isActive: true,
    },
    order: { 
      createdAt: "DESC" 
    },
  });
}
//generar el hash 
private generateQrHash(): string {
  return randomBytes(32).toString("hex");
}

  // ASISTENCIAS & QR

//iniciar pase de asistencia
  async start(dto: StartAttendanceDto){
const schedule = await this.findActiveSchedule(dto.scheduleId);

if (!schedule.teacher){
  throw new ConflictException('El horario no tiene un profesor asignado.');
}

const activeQr= await this.findActiveQr(dto.scheduleId);

if (activeQr && activeQr.expiresAt>new Date()){

activeQr.isActive = false;
await this.qrCodesRepository.save(activeQr);
}

const qr = this.qrCodesRepository.create({

  hashValue:this.generateQrHash(),
  schedule,
  teacher: schedule.teacher,
  expiresAt: new Date(Date.now() + QR_EXPIRATION_TIME),
  isActive:true,
});


    await this.qrCodesRepository.save(qr);
    
    return {
      message:'QR generado exitosamente.',
      qrId: qr.id,
      scheduleId: schedule.id,
      hash: qr.hashValue,
      expiresAt: qr.expiresAt,
    };
  }

//escaneo de qr
async scanQr(userIdFromToken: string, dto: ScanQrDto){
const student = await this.studentsRepository.findOne({
  where: {userId: userIdFromToken},
});

if(!student){
  throw new NotFoundException('Estudiante no encontrado.');
}

const qr = await this.qrCodesRepository.findOne({
  where:{hashValue:dto.qrHash, isActive:true},
  relations: {schedule: true},
});

if (!qr || qr.expiresAt < new Date()){
  throw new BadRequestException ('El QR no es válido o ya ha caducado.');
}


const schedule = qr.schedule;

const enrollment = await this.groupEnrollmentRepo.findOne({
  where: {
    studentId: student.id,
    groupId: schedule.groupId,
  },
});

if (!enrollment) {
  throw new ForbiddenException(
    'No estás inscrito en el grupo de este horario.',
  );
}

//fomatear la fecha 
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const day = String(now.getDate()).padStart(2, "0");
const todayStr = `${year}-${month}-${day}`;

const existingRecord = await this.attendanceRecordsRepository.findOne({
where: {
  studentId: student.id, 
  scheduleId: schedule.id, 
  recordedDate: todayStr
},
});

if (existingRecord){
  throw new ConflictException('Ya has registrado tu asistencia para esta clase el día de hoy.');
}

const [startHour, startMinute]= schedule.startTime.split(":").map(Number);
const classStartTime = new Date();
classStartTime.setHours(startHour, startMinute, 0, 0);

const diffMinutes = (now.getTime() - classStartTime.getTime()) / (1000*60);

const status: "present" | "late" = diffMinutes > LATE_TOLERANCE_MINUTES ? "late" : "present";

const record = this.attendanceRecordsRepository.create({
studentId:student.id,
scheduleId: schedule.id,
status,
qrHash: dto.qrHash,
scanTimestamp: now,
recordedDate: todayStr,
isOffline: false,
isAutoClosed: false,
auditTrail:{
  deviceId: dto.deviceId || "desconocido",
  scannedAt: now.toISOString(),
},
});

await this.attendanceRecordsRepository.save(record);

return {
  message: 
  status === "present"
  ? "Asistencia registrada correctamente."
  : "Asistencia registrada con retardo.",
  status,
  studentId:student.id,
  scheduleId:schedule.id,
  recordedDate: todayStr,
};

}

//Cerrar pase de lista
async closeAttendance(scheduleId:string, recordedByUserId?: string){
  const schedule = await this.schedulesRepository.findOne({
    where: {id: scheduleId, isActive: true},
    relations: {group: true},
  });

  if (!schedule){
    throw new NotFoundException ('Horario no encontrado o inactivo.');
  }
  
  await this.qrCodesRepository.update(
    {schedule: {id: scheduleId}, isActive: true},
    {isActive: false},
  );


  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const todayStr = `${year}-${month}-${day}`;

const enrollments = await this.groupEnrollmentRepo.find({
    where: { groupId: schedule.groupId },
  });

  if (enrollments.length===0){
    return {
      message: "No hay alumnos inscritos en el grupo asignado a este horario.",
      absenteesCount: 0,
    };
  }
  const allStudentsIds = enrollments.map((e)=>e.studentId);



  const existingRecords = await this.attendanceRecordsRepository.find({
    where:{
      scheduleId:schedule.id,
      recordedDate: todayStr,
    },
  });

const registeredStudentIds = new Set(
    existingRecords.map((record) => record.studentId),
  );

  const absentStudentIds= allStudentsIds.filter(
    (studenId)=> !registeredStudentIds.has(studenId),
  );

  if (absentStudentIds.length === 0){
    return {
      message : "Cierre completado. Todos los alumnos registraron asistencia.",
      absenteesCount: 0,
    };
  }

  const absentRecords = absentStudentIds.map((studentId)=>{
    return this.attendanceRecordsRepository.create({
      studentId,
      scheduleId: schedule.id,
      status: "absent",
      recordedDate: todayStr,
      isAutoClosed: true,
      recordedBy: recordedByUserId ? ({id: recordedByUserId} as any): null,
      auditTrail: {
        reason: 'Cierre Automático de clase - QR no escaneado.',
        closedAt: now.toISOString(),
      },
    });
  });

  await this.attendanceRecordsRepository.save(absentRecords);

  return {
    message: "Lista de asistencia cerrada correctamente.",
    totalStudents: allStudentsIds.length,
    presentOrLateCount: registeredStudentIds.size,
    absenteesCount: absentRecords.length,
    recordedDate: todayStr,
  };
}

//pase de lista manual (o para cambiar el estado de la asistencia)
async updateStudentAttendanceManual(
  dto: ManualAttendanceDto,
  teacherUserId: string,
) {
  const { studentId, scheduleId, status, reason } = dto;

  const student = await this.studentsRepository.findOne({
    where: { id: studentId },
  });

  if (!student) {
    throw new NotFoundException("Estudiante no encontrado.");
  }

  const schedule = await this.schedulesRepository.findOne({
    where: { id: scheduleId, isActive: true },
  });

  if (!schedule) {
    throw new NotFoundException("Horario no encontrado o inactivo.");
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const todayStr = `${year}-${month}-${day}`;

  let record = await this.attendanceRecordsRepository.findOne({
    where: {
      studentId: student.id,
      scheduleId: schedule.id,
      recordedDate: todayStr,
    },
  });

  const isNewRecord = !record;

  if (record) {
    const previousStatus = record.status;
    record.status = status;
    record.recordedBy = { id: teacherUserId } as any;
    record.auditTrail = {
      ...(record.auditTrail || {}),
      updatedManuallyAt: now.toISOString(),
      updatedBy: teacherUserId,
      previousStatus,
      newStatus: status,
      reason: reason || "Cambio manual por el profesor",
    };
  } else {
    record = this.attendanceRecordsRepository.create({
      studentId: student.id,
      scheduleId: schedule.id,
      status,
      recordedDate: todayStr,
      scanTimestamp: now,
      isOffline: false,
      isAutoClosed: false,
      recordedBy: { id: teacherUserId } as any,
      auditTrail: {
        createdManuallyAt: now.toISOString(),
        createdBy: teacherUserId,
        reason: reason || "Pase de lista manual por el profesor",
      },
    });
  }

  await this.attendanceRecordsRepository.save(record);

  return {
    message: isNewRecord
      ? "Asistencia registrada manualmente."
      : "Estatus de asistencia actualizado correctamente.",
    recordId: record.id,
    studentId: student.id,
    scheduleId: schedule.id,
    status: record.status,
    recordedDate: todayStr,
  };
}
//porcentaje asistencia (alumnos y padres)
async getStudentMetrics(
  studentId: string,
  currentUser: { id: string; role: string },
  scheduleId?: string,
) {

if (currentUser.role === 'parent') {
    const parent = await this.parentsRepository.findOne({
    where: { user: { id: currentUser.id } },
    });
    if (!parent) {
      throw new ForbiddenException(
        'Acceso denegado. No se encontró registro de padre vinculado.',
      );
    }
    const isMyChild = await this.studentsRepository.findOne({
      where: {
        id: studentId,
        parentId: parent.id,  // ← parents.id contra parents.id ✓
      },
    });
    if (!isMyChild) {
      throw new ForbiddenException(
        'Acceso denegado. Este alumno no está vinculado a tu cuenta.',
      );
    }
  }

  if (currentUser.role === 'student') {
    const isSelf = await this.studentsRepository.findOne({
      where: { id: studentId, userId: currentUser.id },
    });

    if (!isSelf) {
      throw new ForbiddenException(
        'Solo puedes consultar tu propio historial de asistencia.',
      );
    }
  }

  
const student = await this.studentsRepository.findOne({
  where: {id: studentId},
});

if (!student){
  throw new NotFoundException('Estudiante no encontrado.');
}

const whereCondition: any = {studentId: student.id};
if(scheduleId){
  whereCondition.scheduleId= scheduleId;
}

const records = await this.attendanceRecordsRepository.find({
  where: whereCondition,
});

const totalClasses = records.length;

if (totalClasses===0){
  return{
    studentId: student.id,
    attendancePercentage: 0,
    summary: {
      totalClasses: 0,
      present: 0,
      late: 0,
      absent: 0,
      justifiedAbsence: 0,
    },
  };
}

let presentCount = 0;
let lateCount = 0;
let absentCount = 0;
let justifiedCount = 0;

records.forEach((r)=>{
  switch (r.status){
    case "present":
      presentCount++;
      break;

    case "late":
      lateCount++;
      break;
    
    case "absent":
      absentCount++;
      break;
    
    case "justified_absence":
      justifiedCount++;
      break;
  }
});

const effectiveClasses = totalClasses - justifiedCount;
const attendedClasses = presentCount + lateCount;

const attendancePercentage = effectiveClasses > 0 ? Number(((attendedClasses/effectiveClasses)*100).toFixed(2)):100;

return {
  studentId:student.id,
  attendancePercentage, 
  statusAlert:
  attendancePercentage < 80
  ? "ALERTA_RIESGO_FALTAS"
  : "ASISTENCIA_REGULAR",
  summary: {
    totalClasses,
    present: presentCount,
    late: lateCount,
    absent: absentCount,
    justifiedAbsence: justifiedCount,
  },
};
}

//lista en tiempo real para el profe (quien y quien va tomando asistencia)
async getClassAttendanceToday(scheduleId:string){
  const schedule = await this.schedulesRepository.findOne({
    where: {id: scheduleId, isActive:true},
  });

if (!schedule){
  throw new NotFoundException('Horario no encontrado.');
}

const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const day = String(now.getDate()).padStart(2, "0");
const todayStr = `${year}-${month}-${day}`;


const enrollments = await this.groupEnrollmentRepo.find({
  where: {groupId: schedule.groupId},
  relations: {student: {user: true} },
});
const existingRecords = await this.attendanceRecordsRepository.find({
  where : {scheduleId, recordedDate: todayStr},
});

const recordMap = new Map<string, AttendanceRecords>();
existingRecords.forEach((rec) => {
  recordMap.set(rec.studentId, rec);
});

const studentsList = enrollments.map((e)=>{
  const student = e.student;
  const record = recordMap.get(e.studentId);

return {
  studentId: student.id,
  erollmentNumber: student.enrollmentNumber || "N/A",
  fullName: student.user
  ? `${student.user.firstName} ${student.user.lastName}`
  : 'Alumno',
  status: record ? record.status : "pending",
  scanTimeStamp: record?.scanTimestamp || null,
  isAutoclosed: record?.isAutoClosed || false,
};
});

return {
  scheduleId,
  recordedDate: todayStr,
  totalEnrolled: enrollments.length,
  scannedCount: existingRecords.length,
  students: studentsList,
};
}

//lista del grupo con porcentaje de asistencia (profe)

async getGroupStudentsWithAttendanceRate(groupId: string, scheduleId?: string){
const enrollments = await this.groupEnrollmentRepo.find({
  where: {groupId},
  relations: {student: {user: true}},
});


if (enrollments.length===0){
  return {groupId, totalStudents: 0, students: []};
}

const studentsWithRate = await Promise.all(
  enrollments.map(async (e)=>{
    const student = e.student;
    const metrics = await this.getStudentMetrics(student.id, { id: '', role: 'teacher' }, scheduleId);

    return{
      studentId: student.id,
      enrollmentNumber: student.enrollmentNumber || "N/A",
      fullName: student.user
      ? `${student.user.firstName} ${student.user.lastName}`
      : "Alumno",
      attendancePercentage: metrics.attendancePercentage,
      statusAlert: metrics.statusAlert,
      summary: metrics.summary,
    };
  }),
);

return {
  groupId,
  totalStudents: enrollments.length,
  students: studentsWithRate,
};
}



// JUSTIFICATIONS
//crear justificante
async createJustification(dto: CreateJustificationDto) {
  const { studentId, registeredBy, justificationDate, reason, modules } = dto;

  const [year, month, day] = justificationDate.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day);
  const jsDay = dateObj.getDay();
  const dayOfWeek = jsDay === 0 ? 7 : jsDay;

  let targetModules: number[] = [];

  // ESCENARIO 1 MÓDULOS ESPECIFICADOS 
  if (modules && modules.length > 0) {
    targetModules = Array.from(new Set(modules));
  }
  // ESCENARIO 2: DÍA COMPLETO 
  else {
    const enrollment = await this.groupEnrollmentRepo.findOne({
      where: { studentId },
    });

    if (!enrollment) {
      throw new NotFoundException(
        "El estudiante no se encuentra inscrito en ningún grupo activo.",
      );
    }

    // Traemos los horarios del día ordenados por hora de inicio cronológica
    const schedulesForDay = await this.schedulesRepository.find({
      where: {
        groupId: enrollment.groupId,
        dayOfWeek: dayOfWeek,
        isActive: true,
      },
      order: {
        startTime: "ASC", // Ordena las clases desde la mañana a la tarde
      },
    });

    if (schedulesForDay.length === 0) {
      throw new NotFoundException(
        "El alumno no tiene clases programadas para este día de la semana.",
      );
    }

    // Asigna el número de módulo según la secuencia 
    targetModules = schedulesForDay.map((_, index) => index + 1);
  }

  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const recordsToInsert = targetModules.map((moduleNum) => {
      return queryRunner.manager.create(Justifications, {
        studentId,
        reason,
        justificationDate,
        moduleNumber: moduleNum,
        registeredBy: { id: registeredBy } as any,
        isActive: true,
      });
    });

    const savedRecords = await queryRunner.manager.save(
      Justifications,
      recordsToInsert,
    );

    await queryRunner.manager.update(
      AttendanceRecords,
      {studentId, recordedDate: justificationDate},
      {status: 'justified_absence'}
    );

    await queryRunner.commitTransaction();

    return {
      message: modules?.length
        ? "Justificante registrado para los módulos seleccionados."
        : "Justificante registrado para todo el día.",
      totalRecords: savedRecords.length,
      data: savedRecords,
    };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw new BadRequestException(
      `Error al guardar justificante: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  } finally {
    await queryRunner.release();
  }
}

//buscar justificante por id
  async findJustificationById(id: string) {
    const justification = await this.justificationsRepository.findOne({
      where: { id, isActive:true},
    });
    if (!justification) {
      throw new NotFoundException("Justificante no encontrado.");
    }
    return justification;
  }
//actualizar justificante
  async updateJustification(id: string, dto: UpdateJustificationDto) {
    const justification = await this.findJustificationById(id);
  const { registeredBy, ...rest } = dto;
  
  Object.assign(justification, rest);

  if (registeredBy){
    justification.registeredBy = {id: registeredBy} as any;
  }

  await this.justificationsRepository.save(justification);
  return {
    message: 'justificante actualizado correctamente.',
    justification,
  };
  }
//soft delete
  async removeJustification(id: string) {
    const justification = await this.findJustificationById(id);

    justification.isActive = false;
    await this.justificationsRepository.save(justification);

    return {
      message: "Justificante eliminado correctamente.",
    };
  }
//buscar por id del estudiante
  async findJustificationsByStudentId(studentId: string) {
    return this.justificationsRepository.find({
      where: { studentId, isActive: true },
      order: { justificationDate: "DESC" },
    });
  }
//busqueda por nombre del estudiante
  async findJustificationsByStudentName(searchTerm: string) {
    if (!searchTerm || searchTerm.trim() === "") {
      return [];
    }

    const cleanTerm = searchTerm.trim();

    return this.justificationsRepository.find({
      where: [
        {
          student: {
            user: {
              firstName: ILike(`%${cleanTerm}%`),
            },
          },
          isActive: true,
        },
        {
          student: {
            user: {
              lastName: ILike(`%${cleanTerm}%`),
            },
          },
          isActive: true,
        },
      ],
      relations: {
        student: {
          user: true,
        },
      },
      order: {
        justificationDate: "DESC",
      },
    });
  }
   
//todos o filtrar por fecha
 async findAllJustifications(date?: string){
 const whereCondition: any = {isActive: true};

 if (date){
  whereCondition.justificationDate = date;
 }

  return this.justificationsRepository.find({
    where: whereCondition,
    relations: {
      student: {
          user:true,
      },
    },
    order: {
      justificationDate:'DESC',
      createdAt: 'DESC'
    },
  });

 }

  // ACCESS LOGS

  async createAccessLog(dto: CreateAccessLogDto) {
    const log = this.accessLogsRepository.create({
      studentId: dto.studentId,
      eventType: dto.eventType,
      scannedAt: new Date(dto.scannedAt),
      deviceTerminalId: dto.deviceTerminalId,
      isExitReturn: dto.isExitReturn,
      isSynced: true,
      syncedAt: new Date(),
    });

    await this.accessLogsRepository.save(log);

    return {
      message: "Registro de acceso guardado correctamente",
      log,
    };
  }

  async findAccessLogsByStudent(studentId: string) {
    return this.accessLogsRepository.find({
      where: { studentId },
      order: { scannedAt: "DESC" },
    });
  }

  async findAccessLogByStudentName(searchTerm: string) {
    if (!searchTerm || searchTerm.trim() === "") {
      return [];
    }
    const cleanTerm = searchTerm.trim();

    return this.accessLogsRepository.find({
      where: [
        {
          student: {
            user: {
              firstName: ILike(`%${cleanTerm}%`),
            },
          },
        },
        {
          student: {
            user: {
              lastName: ILike(`%${cleanTerm}%`),
            },
          },
        },
      ],
      relations: {
        student: {
          user: true,
        },
      },
      order: {
        scannedAt: "DESC",
      },
    });
  }

//offline operations
// Sincronización individual de registros offline (preservando el tiempo original)
async syncSingleAccessLog(dto: CreateAccessLogDto) {
  const log = this.accessLogsRepository.create({
    studentId: dto.studentId,
    eventType: dto.eventType,
    scannedAt: new Date(dto.scannedAt), 
    deviceTerminalId: dto.deviceTerminalId,
    isExitReturn: dto.isExitReturn ?? false,
    isSynced: true, 
    syncedAt: new Date(), 
  });

  await this.accessLogsRepository.save(log);

  return {
    success: true,
    message: "Registro offline sincronizado exitosamente.",
    logId: log.id,
  };
}


}