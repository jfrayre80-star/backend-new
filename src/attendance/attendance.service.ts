import {Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {In, Repository} from "typeorm";
import {Schedules} from "../academic/Schedules";
import {QrCodes} from "./QrCodes";
import {StartAttendanceDto} from "./start-attendance.dto";

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
}
});

if(!schedule){
    throw new NotFoundException(`Schedule with id ${dto.scheduleId} not found or is not active`);
}
return {
    message: `Attendance started for schedule with id ${dto.scheduleId}`,
    scheduleId: dto.scheduleId,
    startTime: new Date().toISOString()
}
}

}