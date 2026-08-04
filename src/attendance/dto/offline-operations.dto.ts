import { IsString, IsOptional, IsInt, IsEnum, IsObject, IsUUID, IsDateString } from 'class-validator';

export class CreateOfflineOperationDto {
  @IsUUID()
  localId: string;

  @IsString()
  entityType: string;

  @IsEnum(['INSERT', 'UPDATE', 'DELETE'])
  operationType: 'INSERT' | 'UPDATE' | 'DELETE';

  @IsObject()
  payload: object;

  @IsDateString()
  localTimestamp: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  deviceId?: string;
}

export class UpdateOfflineOperationDto {
  @IsOptional()
  @IsEnum(['pending', 'processing', 'completed', 'failed'])
  status?: 'pending' | 'processing' | 'completed' | 'failed';

  @IsOptional()
  @IsInt()
  retryCount?: number;
}