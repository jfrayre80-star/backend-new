import { IsString, IsOptional } from 'class-validator';

export class UpdateParentDto {
  @IsOptional() @IsString() phoneSecondary?: string;
  @IsOptional() @IsString() emergencyContact?: string;
  @IsOptional() @IsString() occupation?: string;
}
