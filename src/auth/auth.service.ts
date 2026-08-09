import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { ActiveSessionsService } from '../infrastructure/active-sessions.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly activeSessionsService: ActiveSessionsService,
  ) {}

  async login(
    identifier: string,
    password: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const profile = await this.usersService.login(identifier, password);

    const deviceId = crypto
      .createHash('sha256')
      .update(userAgent ?? 'desconocido')
      .digest('hex')
      .slice(0, 64);

    // RNF-02: el token se vincula a la sesión concreta mediante jti para que,
    // al cerrar sesión, solo ese token quede revocado (no todas las sesiones
    // del usuario ni las de otros dispositivos).
    const existing = await this.activeSessionsService.findByUserAndDevice(
      profile.id,
      deviceId,
    );
    const sessionId = existing?.id ?? crypto.randomUUID();

    const payload = {
      sub: profile.id,
      email: profile.email,
      role: profile.role,
      jti: sessionId,
    };
    const accessToken = this.jwtService.sign(payload);

    const decoded: any = this.jwtService.decode(accessToken);
    const expiresAt = new Date(decoded.exp * 1000);

    await this.activeSessionsService.register(
      profile.id,
      deviceId,
      crypto.createHash('sha256').update(accessToken).digest('hex'),
      ipAddress ?? null,
      userAgent ?? null,
      expiresAt,
      sessionId,
    );

    return {
      access_token: accessToken,
      user: profile,
    };
  }

  /**
   * RNF-02: Revoca la sesión activa del usuario para el dispositivo actual
   * marcándola como inactiva en la base de datos al cerrar sesión.
   */
  async logout(userId: string, userAgent?: string) {
    const deviceId = crypto
      .createHash('sha256')
      .update(userAgent ?? 'desconocido')
      .digest('hex')
      .slice(0, 64);

    await this.activeSessionsService.deactivateByDevice(userId, deviceId);

    return {
      message: 'Sesión cerrada exitosamente.',
    };
  }

  /**
   * RF-06: Cambia la contraseña del usuario autenticado delegando en
   * UsersService (valida la actual, hashea la nueva y limpia
   * mustChangePassword).
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    await this.usersService.changePassword(userId, currentPassword, newPassword);
    return { message: 'Contraseña actualizada exitosamente.' };
  }
}
