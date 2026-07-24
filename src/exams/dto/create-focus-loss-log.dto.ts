import { IsIn, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateFocusLossLogDto {
  @IsUUID()
  @IsNotEmpty()
  attemptId: string;

  // Tipo de evento de pérdida de foco
  @IsIn(['visibility_change', 'blur', 'tab_hidden'])
  eventType: 'visibility_change' | 'blur' | 'tab_hidden';

  @IsOptional()
  browserInfo?: Record<string, any>;
}
