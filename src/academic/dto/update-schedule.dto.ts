import { PartialType } from '@nestjs/mapped-types';
import { CreateScheduleDto } from './create-schedule.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { TruthyTypesOf } from 'rxjs';


export class UpdateScheduleDto extends PartialType(CreateScheduleDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}