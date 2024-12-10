import { Controller, Get, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { GoogleAuthGuard } from './google.auth.guard';
import { JwtAuthGuard } from './jwt.auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req) {
    if (!req.user) {
      throw new UnauthorizedException();
    }
    return this.authService.googleLogin(req.user);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req) {
    return req.user;
  }

  @Get('refresh')
  @UseGuards(JwtAuthGuard)
  refreshToken(@Req() req) {
    return this.authService.refreshToken(req.user.email);
  }
}