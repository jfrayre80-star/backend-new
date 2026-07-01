import { IsString, IsOptional } from 'class-validator';
export class UpdateStudentDto {
  @IsOptional() @IsString() parentId?: string;
  @IsOptional() @IsString() enrollmentNumber?: string;
  @IsOptional() birthDate?: string;
  @IsOptional() @IsString() admissionScore?: string;
  @IsOptional() @IsString() specialtyId?: string;
  @IsOptional() @IsString() currentSemesterId?: string;
  @IsOptional() isDual?: boolean;
}
