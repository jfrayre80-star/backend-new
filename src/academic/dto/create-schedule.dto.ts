import { IsString, IsUUID, IsInt, Min, Max, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateScheduleDto {
  @IsUUID() subjectId: string;
  @IsUUID() teacherId: string;
  @IsUUID() groupId: string;
  @IsOptional() @IsUUID() classroomId?: string;
  @IsOptional() @IsString() classroomOverride?: string;
  @IsInt() @Min(1)  @Max(7) dayOfWeek: number;
  @IsString() @IsNotEmpty() startTime: string;
  @IsString() @IsNotEmpty() endTime: string;
  @IsString() @IsNotEmpty() semester: string;
}