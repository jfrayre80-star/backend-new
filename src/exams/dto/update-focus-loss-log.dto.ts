import { PartialType } from '@nestjs/mapped-types';
import { CreateFocusLossLogDto } from './create-focus-loss-log.dto';

export class UpdateFocusLossLogDto extends PartialType(CreateFocusLossLogDto) {}
