import {IsNotEmpty, IsUUID, IsString, IsInt, Min, Max} from "class-validator";
export class CreateJustificationDto {
  @IsNotEmpty()
  @IsUUID()
  studentId: string;

  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsNotEmpty()
  justificationDate: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(8)
  moduleNumber: number; 
}