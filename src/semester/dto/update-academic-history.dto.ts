import { PartialType } from '@nestjs/mapped-types';
import { CreateAcademicHistoryDto } from './create-academic-history.dto';

export class UpdateAcademicHistoryDto extends PartialType(CreateAcademicHistoryDto) {}
