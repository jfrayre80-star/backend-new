import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateDisciplinaryReportDto {
  @IsUUID()
  studentId: string;

  @IsUUID()
  reportedById: string;

  @IsEnum(['low', 'medium', 'high', 'critical'])
  severity: 'low' | 'medium' | 'high' | 'critical';

  @IsString()
  @MaxLength(3000)
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  actionTaken?: string;

  @IsOptional()
  @IsBoolean()
  isNotifiedParent?: boolean;
}