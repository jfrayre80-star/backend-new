import { Type } from "class-transformer";
import { IsArray, ValidateNested } from "class-validator";
import { CreateAccessLogDto } from "./create-access-log.dto";

export class SyncGateAccessDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAccessLogDto)
  logItems: CreateAccessLogDto[];
}
