import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupEnrollmentDto } from './create-group-enrollment.dto';

export class UpdateGroupEnrollmentDto extends PartialType(CreateGroupEnrollmentDto) {}
