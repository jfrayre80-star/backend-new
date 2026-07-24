import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import { CreateActivityTeamMemberDto } from './create-activity-team-member.dto';

export class CreateActivityTeamDto {
  @IsUUID()
  activityId: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateActivityTeamMemberDto)
  members: CreateActivityTeamMemberDto[];
}