import { Controller, Post, Body, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';

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
}
