import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateClassroomDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code: string;

  @IsInt()
  @Min(1)
  capacity: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  building?: string;

  @IsOptional()
  @IsInt()
  floor?: number;

  @IsOptional()
  @IsBoolean()
  hasEquipment?: boolean;

  @IsUUID()
  classroomTypeId: string;
}