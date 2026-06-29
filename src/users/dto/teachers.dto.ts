import { IsString, IsOptional } from 'class-validator';

export class CreateTeacherDto {
  @IsString() userId: string;
  @IsString() employeeCode: string;
  @IsOptional() @IsString() specialization?: string;
  @IsOptional() @IsString() hireDate?: string;
}

export class UpdateTeacherDto {
  @IsOptional() @IsString() employeeCode?: string;
  @IsOptional() @IsString() specialization?: string;
  @IsOptional() @IsString() hireDate?: string;
}
