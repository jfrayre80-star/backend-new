import { Type } from "class-transformer";
import { IsArray, ValidateNested } from "class-validator";
import { SyncGateLogItemDto } from "./sync-gate-log-item.dto";

export class SyncGateAccessDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncGateLogItemDto)
  logItems: SyncGateLogItemDto[];
}
