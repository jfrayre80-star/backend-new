import { PartialType } from '@nestjs/mapped-types';
import { CreateActivityTeamDto } from './create-activity-team.dto';

export class UpdateActivityTeamDto extends PartialType(
  CreateActivityTeamDto,
) {}