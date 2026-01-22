import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { UserService } from '../user/user.service';
import { JwtService } from '../../common/jwt.service';
import { FileService } from '../file/file.service';
import { Inject } from '@nestjs/common';
import { REDIS_CLIENT } from '../../database/database.module';
import { RedisClientType } from 'redis';
import { User } from '@app/common';
import { UserCreateDTO } from './dto/auth.dto';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private fileService: FileService,
    @Inject(REDIS_CLIENT) private redis: RedisClientType,
  ) {}

  async createJwt(username: string, password: string) {
    const hashedEmail = createHash('sha256').update(username).digest('hex');

    let user: User;
    try {
      user = await this.userService.get(hashedEmail);
    } catch (e: any) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const hashedPassword = createHash('sha256').update(password).digest('hex');
    if (user.password !== hashedPassword) {
      throw new HttpException('password missmatch', HttpStatus.UNAUTHORIZED);
    }

    const tokens = this.jwtService.generateTokens(user.id);
    return { access: tokens.access, refresh: tokens.refresh };
  }

  async refreshJwt(refreshToken: string) {
    const id = this.jwtService.verifyRefreshToken(refreshToken);

    if (!id) {
      throw new HttpException('invalid token', HttpStatus.UNAUTHORIZED);
    }

    try {
      await this.userService.get(id);
    } catch (e) {
      throw new HttpException('User not found', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return this.jwtService.generateTokens(id);
  }

  async registerByEmail(req: UserCreateDTO, file?: import('@app/common').MulterFile): Promise<User> {
    const encEmail = createHash('sha256').update(req.email!).digest('hex');

    // Check if user already exists
    try {
      await this.userService.get(encEmail);
      throw new HttpException('user already exist', HttpStatus.BAD_REQUEST);
    } catch (e: any) {
      if (e instanceof HttpException) {
        throw e;
      }
      // User doesn't exist - continue
    }

    let uploadUrl = '';
    if (file) {
      uploadUrl = await this.fileService.uploadAvatar(file);
    }

    const hashedPassword = createHash('sha256').update(req.password).digest('hex');

    const newUser: User = {
      id: encEmail,
      username: req.username,
      email: req.email!,
      phone: '',
      first_name: req.first_name,
      address: req.address,
      upload_user: uploadUrl,
      deals: 0,
      password: hashedPassword,
      re_password: '',
      is_superuser: false,
    };

    await this.userService.create(newUser);
    return newUser;
  }

  async registerByPhone(req: UserCreateDTO, file?: import('@app/common').MulterFile): Promise<User> {
    if (!req.phone) {
      throw new HttpException('phone is undefined', HttpStatus.BAD_GATEWAY);
    }

    const encEmail = createHash('sha256').update(req.phone).digest('hex');

    try {
      await this.userService.get(encEmail);
      throw new HttpException('phone exist', HttpStatus.BAD_REQUEST);
    } catch (e: any) {
      if (e instanceof HttpException) {
        throw e;
      }
      // User doesn't exist - continue
    }

    let uploadUrl = '';
    if (file) {
      uploadUrl = await this.fileService.uploadAvatar(file);
    }

    const hashedPassword = createHash('sha256').update(req.password).digest('hex');

    const newUser: User = {
      id: encEmail,
      username: req.username,
      email: '',
      phone: req.phone,
      first_name: req.first_name,
      address: req.address,
      upload_user: uploadUrl,
      deals: 0,
      password: hashedPassword,
      re_password: '',
      is_superuser: false,
    };

    await this.userService.create(newUser);
    return newUser;
  }

  async sendOtp(phone: string): Promise<string> {
    const min = 10000;
    const max = 99999;
    const range = max - min + 1;
    const bytesNeeded = Math.ceil(Math.log2(range) / 8);
    const randomBytesBuf = randomBytes(bytesNeeded);
    const randomNumber = randomBytesBuf.readUIntBE(0, bytesNeeded);
    const code = min + (randomNumber % range);
    const otp = code.toFixed();

    try {
      await axios.post(
        'https://gatewayapi.com/rest/mtsms',
        {
          message: 'Verification Code: ' + otp + '.',
          sender: 'KibTop',
          recipients: [{ msisdn: String(phone).slice(1, phone.length) }],
        },
        {
          headers: {
            Authorization: 'Token an5K975xRj2Ndj8ShBe6KkKqWdKKWytBd45zbcTaWj8izDRBHrpT9l9KbYve6UkM',
          },
        },
      );
    } catch (e) {
      console.log('SMS sending error:', e);
      throw new HttpException('Errored to send otp code', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    try {
      await this.redis.set(phone, otp, { EX: 300 }); // 5 minutes expiry
    } catch (e) {
      throw new HttpException('Redis error', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return 'otp sended';
  }

  async checkOtp(phone: string, otp: string): Promise<string> {
    let otpRedis: string | null;
    try {
      otpRedis = await this.redis.get(phone);
    } catch (e) {
      throw new HttpException('no opt by this number', HttpStatus.BAD_REQUEST);
    }

    if (otpRedis !== otp) {
      throw new HttpException('otp is not valid', HttpStatus.BAD_REQUEST);
    }

    await this.redis.del(phone);
    return 'Good 👍';
  }

  async resetPassword(email: string): Promise<any> {
    const key = createHash('sha256').update(email).digest('hex');
    try {
      await this.userService.get(key);
    } catch (e) {
      throw new HttpException('user not exist', HttpStatus.BAD_REQUEST);
    }

    const rand = randomBytes(16).toString('hex');
    const actKey = createHash('sha256').update(rand).digest('hex');

    try {
      await this.redis.set(
        `pass-rec-${actKey}`,
        JSON.stringify({
          id: key,
          email: email,
        }),
        { EX: 3600 }, // 1 hour expiry
      );
    } catch (e) {
      throw new HttpException('error to set data in cache storage', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // TODO: Send recovery email
    // await sendRecoveryEmail(actKey, email);

    return { token: actKey };
  }

  async confirmPasswordReset(token: string, new_password: string, re_new_password: string): Promise<string> {
    if (new_password !== re_new_password) {
      throw new HttpException('passwords not match', HttpStatus.BAD_REQUEST);
    }

    let recoveryTemp: { id: string; email: string };
    try {
      const value = await this.redis.get(`pass-rec-${token}`);
      if (!value) {
        throw new HttpException('no recovery process by this id', HttpStatus.BAD_REQUEST);
      }
      recoveryTemp = JSON.parse(value);
    } catch (e: any) {
      if (e instanceof HttpException) {
        throw e;
      }
      throw new HttpException('no recovery process by this id', HttpStatus.BAD_REQUEST);
    }

    const hashPassword = createHash('sha256').update(new_password).digest('hex');

    try {
      await this.userService.get(recoveryTemp.id);
    } catch (e) {
      throw new HttpException('user not exist', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    try {
      await this.userService.updatePassword(recoveryTemp.id, hashPassword);
    } catch (e) {
      throw new HttpException('user not saved', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    await this.redis.del(`pass-rec-${token}`);
    return 'good';
  }
}
