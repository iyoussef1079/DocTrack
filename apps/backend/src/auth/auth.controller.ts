import { Controller, Get, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { GoogleAuthGuard } from './google.auth.guard';
import { JwtAuthGuard } from './jwt.auth.guard';
import { AuthService } from './auth.service';
import { GoogleDriveService } from './google-drive-service/google-drive-service.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private googleDriveService: GoogleDriveService) {}

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

    @Get('test-drive')
    @UseGuards(JwtAuthGuard)
    async testDrive(@Req() req) {
    try {
        const testBuffer = Buffer.from('Hello World! This is a test file.');
        const result = await this.googleDriveService.uploadFile(
        req.user.email,
        testBuffer,
        'test.txt'
        );
        return result;
    } catch (error) {
        console.error('Drive Test Error:', error);
        return {
        error: error.message,
        user: req.user.email,
        timestamp: new Date().toISOString()
        };
    }
    }
}