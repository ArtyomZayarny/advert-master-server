import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '../../common/jwt.service';
import { UserService } from '../user/user.service';
import { FileService } from '../file/file.service';
import { AuthGuard } from './auth.guard';
import { User } from '@app/common';
import {
  CreateJwtDTO,
  UserCreateDTO,
  AccountActivationDTO,
  SendOtpDTO,
  OtpCheckDTO,
  GetUsersForChatDTO,
  ConfirmPasswordRecoveryDTO,
  RefreshDTO,
} from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly fileService: FileService,
  ) {}

  @Post('jwt/create')
  @ApiOperation({
    summary: '🔐 User Authentication',
    description: 'Create JWT tokens (access and refresh) for authenticated user',
  })
  @ApiBody({ type: CreateJwtDTO })
  @ApiResponse({
    status: 200,
    description: 'Tokens successfully created',
    schema: {
      example: {
        access: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async createJwt(@Body() req: CreateJwtDTO) {
    return this.authService.createJwt(req.username, req.password);
  }

  @Post('jwt/refresh')
  @ApiOperation({
    summary: '🔄 Refresh Token',
    description: 'Refresh access token using refresh token',
  })
  @ApiBody({ type: RefreshDTO })
  @ApiResponse({
    status: 200,
    description: 'New access token created',
    schema: {
      example: {
        access: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshJwt(@Body() token: RefreshDTO) {
    return this.authService.refreshJwt(token.refresh);
  }

  @Post('users')
  @UseInterceptors(FileInterceptor('upload_user'))
  @ApiOperation({
    summary: '📝 Register New User',
    description: 'Create a new user via email or phone. Avatar can be uploaded.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UserCreateDTO })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    schema: {
      example: {
        access: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 'user123',
          username: 'john_doe',
          email: 'john@example.com',
          first_name: 'John',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid data or user already exists' })
  async users(@Body() req: UserCreateDTO, @UploadedFile() file?: import('@app/common').MulterFile) {

    // Explicit validation: must have either email or phone
    if (!req.email || !req.email.length) {
      if (!req.phone || !req.phone.length) {
        throw new HttpException('Either email or phone must be provided for registration', HttpStatus.BAD_REQUEST);
      }
      return await this.authService.registerByPhone(req, file);
    }

    return await this.authService.registerByEmail(req, file);
  }

  @Post('users/activation')
  async verify(@Body() req: AccountActivationDTO) {
    // TODO: Implement activation flow if needed
    throw new HttpException('Activation flow not implemented', HttpStatus.NOT_IMPLEMENTED);
  }

  @UseGuards(AuthGuard)
  @Get('users/me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '👤 Get Current User',
    description: 'Get information about the current authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'User information',
    schema: {
      example: {
        id: 'user123',
        username: 'john_doe',
        email: 'john@example.com',
        phone: '+905551234567',
        first_name: 'John',
        address: 'Kyrenia, Northern Cyprus',
        upload_user: 'https://s3.amazonaws.com/bucket/avatar.jpg',
        deals: 5,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async usersGetMe(@Headers('Authorization') bearer: string) {
    const id = this.jwtService.verifyToken(bearer.split(' ')[1]);

    let user;
    try {
      user = await this.userService.get(id);
    } catch (e) {
      throw new HttpException('user not exist', HttpStatus.BAD_REQUEST);
    }

    // Remove sensitive data
    const { password, re_password, ...userPublic } = user;
    return userPublic;
  }

  @UseGuards(AuthGuard)
  @Put('users/me')
  @UseInterceptors(FileInterceptor('upload_user'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '✏️ Update User Profile',
    description: 'Update current user data. Can update name, address, phone, email, and avatar.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: 'Profile successfully updated',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async putUser(@Body() req: any, @Headers('Authorization') bearer: string, @UploadedFile() file?: import('@app/common').MulterFile) {
    const id = this.jwtService.verifyToken(bearer.split(' ')[1]);

    let user: any;
    try {
      user = await this.userService.get(id);
    } catch (e) {
      throw new HttpException('user not exist', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (file) {
      const uploadUrl = await this.fileService.uploadAvatar(file);
      user.upload_user = uploadUrl;
    }

    if (req.phone !== undefined) user.phone = req.phone;
    if (req.address !== undefined) user.address = req.address;
    if (req.email !== undefined) user.email = req.email;
    if (req.first_name !== undefined) user.first_name = req.first_name;

    try {
      await this.userService.updateAllUserData(user);
    } catch (e) {
      throw new HttpException('cant save user data', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const { password, re_password, ...userPublic } = user;
    return userPublic;
  }

  @Post('otp/send')
  @ApiTags('otp')
  @ApiOperation({
    summary: '📱 Send OTP Code',
    description: 'Send OTP code to the specified phone number for registration',
  })
  @ApiBody({ type: SendOtpDTO })
  @ApiResponse({
    status: 200,
    description: 'OTP code sent',
    schema: {
      example: {
        success: true,
        message: 'OTP code sent',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid phone number' })
  async phoneOtp(@Body() req: SendOtpDTO) {
    return this.authService.sendOtp(req.phone);
  }

  @Post('otp/check')
  @ApiTags('otp')
  @ApiOperation({
    summary: '✅ Verify OTP Code',
    description: 'Verify OTP code and create user on successful verification',
  })
  @ApiBody({ type: OtpCheckDTO })
  @ApiResponse({
    status: 200,
    description: 'OTP code verified, user created',
    schema: {
      example: {
        access: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid OTP code' })
  async otpCheck(@Body() req: OtpCheckDTO) {
    return this.authService.checkOtp(req.phone, req.otp);
  }

  @Post('users/chat')
  async getUsersForChat(@Body() req: GetUsersForChatDTO) {
    try {
      const users = await this.userService.getUsersByIds(req.id);
      return users.map((user) => {
        const { password, re_password, ...userPublic } = user;
        return userPublic;
      });
    } catch (error) {
      throw new HttpException('db error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('users/reset_password')
  async resetPassword(@Body() req: { email: string }) {
    return this.authService.resetPassword(req.email);
  }

  @Post('users/reset_password_confirm')
  async resetPasswordConfirm(@Body() req: ConfirmPasswordRecoveryDTO) {
    return this.authService.confirmPasswordReset(req.token, req.new_password, req.re_new_password);
  }

  @Get('users/:id')
  @ApiTags('users')
  @ApiOperation({
    summary: '👤 Get User by ID',
    description: 'Get public information about a user by their ID',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User information',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string) {
    if (!id) return {};
    let user: any = {};

    try {
      user = await this.userService.get(id);
    } catch (e) {
      throw new HttpException('cant find user', HttpStatus.NOT_FOUND);
    }

    const { password, re_password, ...userPublic } = user;
    return userPublic;
  }

  @Get('checkuser/:id')
  async checkUser(@Query('id') id: string) {
    try {
      const user = await this.userService.get(id);
      const { password, re_password, ...userPublic } = user;
      return userPublic;
    } catch (error) {
      throw new HttpException('false', HttpStatus.NOT_FOUND);
    }
  }

}
