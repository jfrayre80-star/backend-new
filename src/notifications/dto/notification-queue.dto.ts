import { IsString, IsOptional, IsInt, IsEnum, IsObject, IsDateString, IsIn, IsNotEmpty } from 'class-validator';

export class CreateNotificationQueueDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['email', 'push', 'system_alert', 'bulk_notice', 'dual_reminder'])
  type: string;

  @IsObject()
  payload: object;

  @IsOptional()
  @IsEnum(['pending', 'processing', 'completed', 'failed'])
  status?: 'pending' | 'processing' | 'completed' | 'failed';

  @IsOptional()
  @IsInt()
  maxRetries?: number;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}

export class UpdateNotificationQueueDto {
  @IsOptional()
  @IsEnum(['pending', 'processing', 'completed', 'failed'])
  status?: 'pending' | 'processing' | 'completed' | 'failed';

  @IsOptional()
  @IsInt()
  retryCount?: number;

  @IsOptional()
  @IsString()
  errorMessage?: string;
}