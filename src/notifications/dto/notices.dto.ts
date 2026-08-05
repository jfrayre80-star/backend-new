import { IsString, IsOptional, IsUUID, IsEnum, IsBoolean, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateNoticeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsUUID()
  createdById?: string;

  @IsOptional()
  @IsEnum(['admin', 'teacher', 'student', 'parent'])
  targetRole?: 'admin' | 'teacher' | 'student' | 'parent';

  @IsOptional()
  @IsUUID()
  targetGroupId?: string;

  @IsOptional()
  @IsBoolean()
  isGlobal?: boolean;

  @IsOptional()
  @IsEnum(['low', 'normal', 'high', 'urgent'])
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export class UpdateNoticeDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(['admin', 'teacher', 'student', 'parent'])
  targetRole?: 'admin' | 'teacher' | 'student' | 'parent';

  @IsOptional()
  @IsUUID()
  targetGroupId?: string;

  @IsOptional()
  @IsBoolean()
  isGlobal?: boolean;

  @IsOptional()
  @IsEnum(['low', 'normal', 'high', 'urgent'])
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}