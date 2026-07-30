import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class ManualAttendanceDto {
  @IsNotEmpty()
  @IsUUID()
  studentId: string;

  @IsNotEmpty()
  @IsUUID()
  scheduleId: string;

  @IsNotEmpty()
  @IsEnum(["present", "late", "absent", "justified_absence"], {
    message: "El estado debe ser: present, late, absent o justified_absence",
  })
  status: "present" | "late" | "absent" | "justified_absence";

  @IsOptional()
  @IsString()
  reason?: string;
}