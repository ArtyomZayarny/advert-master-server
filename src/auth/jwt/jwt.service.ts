import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sign, verify } from 'jsonwebtoken';

@Injectable()
export class JwtService {
  private readonly secret: string;
  private readonly refreshSecret: string;

  constructor(private configService: ConfigService) {
    this.secret = this.configService.get('SECRET') || 'your-secret-key';
    this.refreshSecret = this.configService.get('REFRESH_SECRET') || 'your-refresh-secret-key';
  }

  /**
   * Generates access and refresh tokens for a given user.
   */
  generateTokens(id: string): { access: string; refresh: string } {
    const accessTokenPayload = { id };
    const refreshTokenPayload = { id };

    const accessToken = sign(accessTokenPayload, this.secret, { expiresIn: '1h' });
    const refreshToken = sign(refreshTokenPayload, this.refreshSecret);

    return { access: accessToken, refresh: refreshToken };
  }

  /**
   * Verifies the validity of an access token.
   */
  verifyToken(token: string): string {
    try {
      const payload = verify(token, this.secret) as { id: string };
      return payload.id;
    } catch (error) {
      console.log('Token verification error:', error);
      throw error;
    }
  }

  /**
   * Verifies the validity of a refresh token.
   */
  verifyRefreshToken(token: string): string | null {
    try {
      const payload = verify(token, this.refreshSecret) as { id: string };
      return payload.id;
    } catch (error) {
      return null;
    }
  }
}
