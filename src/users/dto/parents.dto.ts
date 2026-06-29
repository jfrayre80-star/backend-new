import { IsString, IsOptional } from 'class-validator';

export class CreateParentDto {
  @IsString() userId: string;
  @IsOptional() @IsString() phoneSecondary?: string;
  @IsOptional() @IsString() emergencyContact?: string;
  @IsOptional() @IsString() occupation?: string;
}

export class UpdateParentDto {
  @IsOptional() @IsString() phoneSecondary?: string;
  @IsOptional() @IsString() emergencyContact?: string;
  @IsOptional() @IsString() occupation?: string;
}
