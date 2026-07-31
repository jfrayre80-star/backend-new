import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanyTutorDto } from './create-company-tutor.dto';

export class UpdateCompanyTutorDto extends PartialType(
  CreateCompanyTutorDto,
) {}
