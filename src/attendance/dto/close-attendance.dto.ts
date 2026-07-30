import { IsNotEmpty, IsUUID } from "class-validator";

export class CloseAttendanceDto {
  @IsNotEmpty()
  @IsUUID()
  scheduleId: string;
}