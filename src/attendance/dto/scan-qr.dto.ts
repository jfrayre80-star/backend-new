import {IsNotEmpty, IsString, IsOptional} from "class-validator";

export class ScanQrDto {
  @IsNotEmpty()
  @IsString()
  qrHash: string;

  @IsOptional()
  @IsString()
  deviceId?: string;
}