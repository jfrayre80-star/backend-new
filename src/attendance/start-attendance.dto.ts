import {IsNotEmpty, IsString, IsUUID} from "class-validator";

export class StartAttendanceDto {
    @IsNotEmpty()
    @IsUUID()
    scheduleId: string;
}

