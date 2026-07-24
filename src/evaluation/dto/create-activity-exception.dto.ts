import {
  IsDateString,
  IsUUID,
} from 'class-validator';

export class CreateActivityExceptionDto {
  @IsUUID()
  activityId: string;

  @IsUUID()
  studentId: string;

  @IsUUID()
  createdBy: string;

  @IsDateString()
  reopenedUntil: Date;
}