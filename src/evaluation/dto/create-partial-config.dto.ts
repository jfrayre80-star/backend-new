import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class CreatePartialConfigDto {
  @IsUUID()
  evaluationSchemeId: string;

  @IsInt()
  @Min(1)
  @Max(3)
  partialNumber: number;
}