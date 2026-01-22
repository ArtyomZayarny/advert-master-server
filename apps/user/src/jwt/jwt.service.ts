import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verify } from 'jsonwebtoken';

@Injectable()
export class JwtService {
  private readonly secret: string;

  constructor(private configService: ConfigService) {
    this.secret = this.configService.get('SECRET') || 'your-secret-key';
  }

  verifyToken(token: string): string {
    try {
      const payload = verify(token, this.secret) as { id: string };
      return payload.id;
    } catch (error) {
      throw error;
    }
  }
}
