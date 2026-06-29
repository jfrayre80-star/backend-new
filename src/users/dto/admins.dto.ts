import { IsString, IsOptional } from 'class-validator';

export class CreateAdminDto {
  @IsString() userId: string;
  @IsString() employeeCode: string;
  @IsOptional() @IsString() department?: string;
  @IsOptional() @IsString() hireDate?: string;
}

export class UpdateAdminDto {
  @IsOptional() @IsString() employeeCode?: string;
  @IsOptional() @IsString() department?: string;
  @IsOptional() @IsString() hireDate?: string;
}
