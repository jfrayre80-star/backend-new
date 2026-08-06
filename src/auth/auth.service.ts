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
    const payload = { sub: profile.id, email: profile.email, role: profile.role };
    const accessToken = this.jwtService.sign(payload);

    const decoded: any = this.jwtService.decode(accessToken);
    const expiresAt = new Date(decoded.exp * 1000);

    const deviceId = crypto
      .createHash('sha256')
      .update(userAgent ?? 'desconocido')
      .digest('hex')
      .slice(0, 64);

    await this.activeSessionsService.register(
      profile.id,
      deviceId,
      crypto.createHash('sha256').update(accessToken).digest('hex'),
      ipAddress ?? null,
      userAgent ?? null,
      expiresAt,
    );

    return {
      access_token: accessToken,
      user: profile,
    };
  }
}
