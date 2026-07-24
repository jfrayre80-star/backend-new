import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateActivityDeliveryDto {
  @IsUUID()
  activityId: string;

  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumberString()
  weight: string;

  @IsDateString()
  dueDate: Date;

  @IsOptional()
  @IsBoolean()
  requiresFile?: boolean;

  @IsOptional()
  @IsString()
  fileTypesAllowed?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxFileSizeMb?: number;

  @IsInt()
  @Min(1)
  sortOrder: number;
}