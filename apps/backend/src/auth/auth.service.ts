import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

export interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly users: Map<string, GoogleUser> = new Map();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async validateUser(userData: GoogleUser): Promise<GoogleUser> {
    // In a real application, you would typically:
    // 1. Check if user exists in database
    // 2. Create user if they don't exist
    // 3. Update user's Google tokens
    this.users.set(userData.email, userData);
    return userData;
  }

  async googleLogin(user: GoogleUser) {
    if (!user) {
      throw new UnauthorizedException('No user from Google');
    }

    const payload = {
      email: user.email,
      sub: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    };

    return {
      success: true,
      access_token: this.jwtService.sign(payload),
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        picture: user.picture
      }
    };
  }

  async getUser(email: string): Promise<GoogleUser | undefined> {
    return this.users.get(email);
  }

  async refreshToken(email: string) {
    const user = await this.getUser(email);
    if (!user) {
      throw new UnauthorizedException();
    }

    const payload = {
      email: user.email,
      sub: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    };

    return {
      access_token: this.jwtService.sign(payload)
    };
  }
}