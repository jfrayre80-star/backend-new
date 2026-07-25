import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateSubmissionDto {
  @IsOptional()
  @IsUUID()
  localId?: string;

  @IsUUID()
  activityDeliveryId: string;

  @IsUUID()
  studentId: string;

  @IsOptional()
  @IsUUID()
  teamId?: string;

  @IsOptional()
  @IsArray()
  files?: object[];

  @IsOptional()
  @IsDateString()
  submittedAt?: string;

  @IsOptional()
  @IsDateString()
  localTimestamp?: string;

  @IsOptional()
  @IsBoolean()
  isOffline?: boolean;

  @IsOptional()
  @IsInt()
  clockDriftSeconds?: number;
}