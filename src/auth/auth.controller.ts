import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { ChangePasswordDto } from '../users/dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: { identifier: string; password: string }, @Req() req: Request) {
    return this.authService.login(
      dto.identifier,
      dto.password,
      req.ip,
      req.headers['user-agent'],
    );
  }

  /**
   * RNF-02: Endpoint para cerrar sesión que revoca y desactiva
   * la sesión del usuario en la base de datos.
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(
    @CurrentUser() user: { id: string },
    @Req() req: Request,
  ) {
    return this.authService.logout(user.id, req.headers['user-agent']);
  }

  /**
   * RF-06: Endpoint para que el usuario autenticado cambie su propia
   * contraseña (debe enviar la actual para autorizar el cambio).
   */
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  changePassword(
    @CurrentUser() user: { id: string },
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.id, dto.currentPassword, dto.newPassword);
  }
}
