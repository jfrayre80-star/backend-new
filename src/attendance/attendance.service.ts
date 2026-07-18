import {Injectable, NotFoundException, ConflictException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Schedules} from "../academic/Schedules";
import {QrCodes} from "./QrCodes";
import {StartAttendanceDto} from "./start-attendance.dto";
import {randomBytes} from "crypto";

@Injectable() export class AttendanceService{

constructor(

    @InjectRepository(Schedules)
    private readonly schedulesRepository: Repository<Schedules>,

    @InjectRepository(QrCodes)
    private readonly qrCodesRepository: Repository<QrCodes>
){}

async start(dto: StartAttendanceDto) {
    
const schedule = await this.schedulesRepository.findOne({
where:{id:dto.scheduleId,
    isActive:true
},
relations:{
    teacher:true,
}
});

if(!schedule){
    throw new NotFoundException(`Schedule with id ${dto.scheduleId} not found or is not active`);
}
const activeQr = await this.qrCodesRepository.findOne({
  where: {
    schedule: {
      id: dto.scheduleId,
    },
    isActive: true,
  },
  order: {
    createdAt: "DESC",
  },
});

if(activeQr && activeQr.expiresAt > new Date()){
throw new ConflictException(`An active QR code already exists for this schedule and has not expired yet. Please wait until it expires or deactivate it before creating a new one.`);
}

if (activeQr && activeQr.expiresAt <= new Date()){
activeQr.isActive = false;
await this.qrCodesRepository.save(activeQr);
}

const hash = randomBytes(32).toString('hex');

const qr= this.qrCodesRepository.create({
hashValue:hash,
schedule:schedule,
teacher:schedule.teacher,
expiresAt:new Date(Date.now() + 30000), 
isActive:true,
});

await this.qrCodesRepository.save(qr);

return {
    message: "QR generated successfully",
    qrId: qr.id,
    hash:qr.hashValue,
    expiresAt:qr.expiresAt,
}
}

}