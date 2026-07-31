import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCompanyTutorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string | null;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string | null;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  companyName: string;
}
