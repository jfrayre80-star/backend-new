import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateActiveSessionDto {
  @IsString() userId: string;
  @IsString() deviceId: string;
  @IsString() tokenHash: string;
  @IsOptional() @IsString() ipAddress?: string;
  @IsOptional() @IsString() userAgent?: string;
  @IsString() expiresAt: string;
}

export class UpdateActiveSessionDto {
  @IsOptional() @IsBoolean() isActive?: boolean;
}
