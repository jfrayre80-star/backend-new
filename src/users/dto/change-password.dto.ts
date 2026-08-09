import { IsString, MinLength } from 'class-validator';

// RF-06: DTO para el cambio de contraseña del usuario autenticado.
export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
