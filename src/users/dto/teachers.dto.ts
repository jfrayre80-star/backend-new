import { IsString, IsOptional } from 'class-validator';

export class UpdateTeacherDto {
  @IsOptional() @IsString() employeeCode?: string;
  @IsOptional() @IsString() specialization?: string;
  @IsOptional() @IsString() hireDate?: string;
}
