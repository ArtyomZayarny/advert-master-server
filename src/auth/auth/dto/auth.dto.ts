import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateJwtDTO {
  @ApiProperty({
    description: 'User email or phone',
    example: 'user@example.com',
    required: true,
  })
  @IsEmail()
  username: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePassword123!',
    minLength: 6,
    required: true,
  })
  @IsNotEmpty()
  password: string;
}

export class UserCreateDTO {
  @ApiProperty({
    description: 'Username',
    example: 'john_doe',
    required: true,
  })
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'User email (required if phone is not provided)',
    example: 'john@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'User phone (required if email is not provided)',
    example: '+905551234567',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({
    description: 'First name',
    example: 'John',
    required: true,
  })
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({
    description: 'Address',
    example: 'Kyrenia, Northern Cyprus',
    required: false,
  })
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Password',
    example: 'SecurePassword123!',
    minLength: 6,
    required: true,
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Password confirmation',
    example: 'SecurePassword123!',
    required: true,
  })
  @IsNotEmpty()
  re_password: string;

  @ApiProperty({
    description: 'User avatar (file)',
    type: 'string',
    format: 'binary',
    required: false,
  })
  upload_user?: any;
}

export class AccountActivationDTO {
  @ApiProperty({
    description: 'Activation token',
    example: 'activation_token_123',
    required: true,
  })
  @IsNotEmpty()
  token: string;
}

export class SendOtpDTO {
  @ApiProperty({
    description: 'Phone number for OTP sending',
    example: '+905551234567',
    required: true,
  })
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;
}

export class OtpCheckDTO extends SendOtpDTO {
  @ApiProperty({
    description: 'OTP code for verification',
    example: '123456',
    required: true,
  })
  @IsNotEmpty()
  otp: string;
}

export class GetUsersForChatDTO {
  @ApiProperty({
    description: 'Array of user IDs',
    example: ['user1', 'user2', 'user3'],
    type: [String],
    required: true,
  })
  id: string[];
}

export class ConfirmPasswordRecoveryDTO {
  @ApiProperty({
    description: 'New password',
    example: 'NewSecurePassword123!',
    minLength: 6,
    required: true,
  })
  @IsNotEmpty()
  new_password: string;

  @ApiProperty({
    description: 'New password confirmation',
    example: 'NewSecurePassword123!',
    required: true,
  })
  @IsNotEmpty()
  re_new_password: string;

  @ApiProperty({
    description: 'Password recovery token',
    example: 'recovery_token_123',
    required: true,
  })
  @IsNotEmpty()
  token: string;
}

export class RefreshDTO {
  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: true,
  })
  @IsNotEmpty()
  refresh: string;
}

export class GoogleSocialAuthDTO {
  @ApiProperty({
    description: 'Google OAuth token',
    example: 'google_oauth_token_123',
    required: true,
  })
  @IsNotEmpty()
  auth_token: string;
}
