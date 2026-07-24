import { IsUUID } from 'class-validator';

export class CreateActivityTeamMemberDto {
  @IsUUID()
  studentId: string;
}