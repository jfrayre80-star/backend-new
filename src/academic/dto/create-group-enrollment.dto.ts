import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateGroupEnrollmentDto {
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @IsUUID()
  @IsNotEmpty()
  groupId: string;
}
