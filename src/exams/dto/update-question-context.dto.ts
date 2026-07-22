import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestionContextDto } from './create-question-context.dto';

export class UpdateQuestionContextDto extends PartialType(CreateQuestionContextDto) {}
