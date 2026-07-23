import { PartialType } from '@nestjs/mapped-types';
import { CreateSemesterGradeDto } from './create-semester-grade.dto';

export class UpdateSemesterGradeDto extends PartialType(CreateSemesterGradeDto) {}
