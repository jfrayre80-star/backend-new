import {IsUUID, IsNotEmpty, IsDateString, IsOptional, IsString, IsArray, IsInt, Min, Max,} from 'class-validator';

export class CreateJustificationDto {
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @IsUUID()
  @IsNotEmpty()
  registeredBy: string; 

  @IsDateString()
  @IsNotEmpty()
  justificationDate: string; 
  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(10, { each: true })
  modules?: number[];
}