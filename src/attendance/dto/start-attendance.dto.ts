import {IsNotEmpty, IsUUID, IsString, IsEnum, IsOptional} from "class-validator";

export class StartAttendanceDto {
    @IsNotEmpty()
    @IsUUID()
    scheduleId: string;
}
export class ScanQrDto {
  @IsNotEmpty()
  @IsString()
  qrHash: string;

  @IsOptional()
  @IsString()
  deviceId?: string;
}

