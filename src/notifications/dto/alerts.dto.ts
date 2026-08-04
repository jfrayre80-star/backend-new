import { IsString, IsOptional, IsUUID, IsBoolean, IsObject, IsNotEmpty, IsIn, MaxLength } from 'class-validator';

export class CreateAlertDto {
  @IsUUID()
  studentId: string;

  @IsUUID()
  parentId: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['critical_absences', 'risk_of_failure', 'low_performance', 'exam_closed', 'disciplinary', 'dual_reminder', 'access_anomaly'])
  alertType: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsObject()
  metadata?: object;
}

export class UpdateAlertDto {
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @IsOptional()
  @IsObject()
  metadata?: object;
}