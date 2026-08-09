import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ActiveSessionsService } from '../infrastructure/active-sessions.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly activeSessionsService: ActiveSessionsService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'mi-secreto',
    });
  }

  /**
   * RNF-02: Valida el payload JWT y verifica que la sesión concreta vinculada
   * al token (jti) siga activa en la base de datos. Un logout desactiva la
   * sesión de ese dispositivo y, con ello, revoca exactamente ese token.
   */
  async validate(payload: any) {
    if (!payload?.jti) {
      throw new UnauthorizedException('Sesión revocada o inactiva.');
    }

    const session = await this.activeSessionsService.findById(payload.jti);
    if (!session || session.isActive !== true) {
      throw new UnauthorizedException('Sesión revocada o inactiva.');
    }

    if (session.userId !== payload.sub) {
      throw new UnauthorizedException('Sesión revocada o inactiva.');
    }

    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
