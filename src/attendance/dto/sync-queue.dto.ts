import { IsString, IsOptional, IsInt, IsEnum, IsObject, Min, MaxLength } from 'class-validator';

export class CreateSyncQueueDto {
  @IsString()
  @MaxLength(50)
  entityType: string;

  @IsObject()
  payload: object;

  @IsOptional()
  @IsEnum(['pending', 'processing', 'completed', 'failed'])
  status?: 'pending' | 'processing' | 'completed' | 'failed';

  @IsOptional()
  @IsInt()
  retryCount?: number;

  @IsOptional()
  @IsInt()
  maxRetries?: number;

  @IsOptional()
  @IsString()
  errorMessage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  deviceTerminalId?: string;
}

export class UpdateSyncQueueDto {
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