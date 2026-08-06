import { PartialType } from '@nestjs/mapped-types';
import { CreateWeeklyLogDto } from './create-weekly-log.dto';

export class UpdateWeeklyLogDto extends PartialType(CreateWeeklyLogDto) {}
