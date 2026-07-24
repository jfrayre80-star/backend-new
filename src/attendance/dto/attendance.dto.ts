import { Type } from "class-transformer";
import {IsNotEmpty, IsUUID, IsString, IsEnum, IsOptional, IsBoolean, IsArray, ValidateNested, IsInt, Min, Max} from "class-validator";

export class StartAttendanceDto {
    @IsNotEmpty()
    @IsUUID()
    scheduleId: string;
}

export class SyncGateLogItemDto {
  @IsNotEmpty()
  @IsUUID()
  studentId: string;
  
  @IsNotEmpty()
  @IsEnum(['entry', 'exit'])
  status: "entry" | "exit" ;

  @IsNotEmpty()
  scannedAt: Date;

  @IsNotEmpty()
  @IsString()
  deviceTerminalId: string;

  @IsOptional()
  @IsBoolean()
  isExitReturn?: boolean;
}


