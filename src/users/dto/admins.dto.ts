import { IsString, IsOptional } from 'class-validator';
export class UpdateAdminDto {
  @IsOptional() @IsString() employeeCode?: string;
  @IsOptional() @IsString() department?: string;
  @IsOptional() @IsString() hireDate?: string;
}
