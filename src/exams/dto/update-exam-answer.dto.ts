import { PartialType } from '@nestjs/mapped-types';
import { CreateExamAnswerDto } from './create-exam-answer.dto';

export class UpdateExamAnswerDto extends PartialType(CreateExamAnswerDto) {}
