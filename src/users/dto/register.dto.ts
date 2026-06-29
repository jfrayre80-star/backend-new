import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';

export class RegisterAdminDto {
  @IsEmail() email: string;
  @IsString() @MinLength(6) passwordHash: string;
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsOptional() @IsString() phone?: string;
  @IsString() employeeCode: string;
  @IsOptional() @IsString() department?: string;
}

export class RegisterTeacherDto {
  @IsEmail() email: string;
  @IsString() @MinLength(6) passwordHash: string;
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsOptional() @IsString() phone?: string;
  @IsString() employeeCode: string;
  @IsOptional() @IsString() specialization?: string;
}

export class RegisterParentDto {
  @IsEmail() email: string;
  @IsString() @MinLength(6) passwordHash: string;
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() phoneSecondary?: string;
  @IsOptional() @IsString() emergencyContact?: string;
  @IsOptional() @IsString() occupation?: string;
}

export class RegisterStudentDto {
  @IsEmail() email: string;
  @IsString() @MinLength(6) passwordHash: string;
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsOptional() @IsString() phone?: string;
  @IsString() enrollmentNumber: string;
  @IsOptional() @IsString() birthDate?: string;
  @IsOptional() @IsString() specialtyId?: string;
  @IsEmail() parentEmail: string;
  @IsString() @MinLength(6) parentPassword: string;
  @IsString() parentFirstName: string;
  @IsString() parentLastName: string;
  @IsOptional() @IsString() parentPhone?: string;
  @IsOptional() @IsString() parentPhoneSecondary?: string;
  @IsOptional() @IsString() parentOccupation?: string;
}
