import {IsNotEmpty, IsUUID, IsEnum,} from "class-validator";
export class ManualAttendanceDto {
@IsNotEmpty()
@IsUUID()
studentId: string;

@IsNotEmpty()
@IsUUID()
scheduleId: string;

@IsNotEmpty()
@IsEnum(['present', 'late', 'absent', 'justified_absence'])
status: "present" | "late" | "absent" | "justified_absence";
}