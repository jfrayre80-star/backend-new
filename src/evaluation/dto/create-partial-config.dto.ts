import { IsInt, IsUUID, Min } from 'class-validator';

export class CreatePartialConfigDto {
  @IsUUID()
  evaluationSchemeId: string;

  @IsInt()
  @Min(1)
  partialNumber: number;
}