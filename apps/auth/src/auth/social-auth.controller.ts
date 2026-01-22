import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { AuthService } from './auth.service';
import { JwtService } from '../jwt/jwt.service';
import { UserService } from '../user/user.service';
import { GoogleSocialAuthDTO } from './dto/auth.dto';
import { User } from '@app/common';

@ApiTags('social')
@Controller('social_auth')
export class SocialAuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  @Post('google')
  @ApiOperation({
    summary: '🌐 Google OAuth Authentication',
    description: 'Authenticate or register user via Google OAuth',
  })
  @ApiBody({ type: GoogleSocialAuthDTO })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful, JWT tokens returned',
    schema: {
      example: {
        access: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 401, description: 'Invalid Google token' })
  async googleSocialAuth(@Body() req: GoogleSocialAuthDTO) {
    const { auth_token } = req;

    if (!auth_token) {
      throw new HttpException('auth_token is required', HttpStatus.BAD_REQUEST);
    }

    try {
      // Verify Google ID token
      const client = new OAuth2Client(this.configService.get('GOOGLE_CLIENT_ID'));
      const ticket = await client.verifyIdToken({
        idToken: auth_token,
        audience: this.configService.get('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new HttpException('Invalid token payload', HttpStatus.UNAUTHORIZED);
      }

      // Verify issuer
      if (!payload.iss || !payload.iss.includes('accounts.google.com')) {
        throw new HttpException('Invalid token issuer', HttpStatus.UNAUTHORIZED);
      }

      const email = payload.email;
      const given_name = payload.given_name || '';
      const sub = payload.sub;

      if (!email) {
        throw new HttpException('Email not found in token', HttpStatus.BAD_REQUEST);
      }

      // Hash email to get user ID (consistent with existing system)
      const encEmail = createHash('sha256').update(email).digest('hex');

      let user: User;
      try {
        // Try to get existing user
        user = await this.userService.get(encEmail);

        // User exists, generate JWT tokens
        const tokens = this.jwtService.generateTokens(user.id);
        return { access: tokens.access, refresh: tokens.refresh };
      } catch (e) {
        // User doesn't exist, create new user
        const username = email.replace('@', '_');

        const newUser: User = {
          id: encEmail,
          username: username,
          email: email,
          phone: '',
          first_name: given_name,
          address: '',
          upload_user: '',
          deals: 0,
          password: '',
          re_password: '',
          is_superuser: false,
        };

        try {
          await this.userService.create(newUser);

          // Generate JWT tokens for new user
          const tokens = this.jwtService.generateTokens(newUser.id);
          return { access: tokens.access, refresh: tokens.refresh };
        } catch (createError) {
          console.error('OAuth create user failed:', createError);
          throw new HttpException('Failed to create user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    } catch (error: any) {
      console.error('OAuth error:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(error.message || 'Invalid Google token', HttpStatus.UNAUTHORIZED);
    }
  }
}
