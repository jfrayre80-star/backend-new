import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(identifier: string, password: string) {
    const profile = await this.usersService.login(identifier, password);
    const payload = { sub: profile.id, email: profile.email, role: profile.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: profile,
    };
  }
}
