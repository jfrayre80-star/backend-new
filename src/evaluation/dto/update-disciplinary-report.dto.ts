import { PartialType } from '@nestjs/mapped-types';
import { CreateDisciplinaryReportDto } from './create-disciplinary-report.dto';

export class UpdateDisciplinaryReportDto extends PartialType(
  CreateDisciplinaryReportDto,
) {}