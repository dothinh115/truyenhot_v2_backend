import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/user/schema/user.schema';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RefreshToken } from 'src/auth/schema/refresh-token.schema';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { TQuery } from 'src/utils/models/query.model';
import { UserService } from 'src/user/user.service';
import { MailService } from 'src/mail/mail.service';
import { RefreshTokenAuthDto } from './dto/refresh-token-auth.dto';
import settings from '../settings.json';
import { JwtService } from '@nestjs/jwt';
import { BcryptService } from 'src/bcrypt/bcrypt.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshToken>,
    private userService: UserService,
    private mailService: MailService,
    private jwtService: JwtService,
    private bcryptService: BcryptService,
  ) {}
  async login(body: LoginAuthDto) {
    const { email, password } = body;

    const exists = await this.userModel
      .findOne({
        email: email.toLowerCase(),
      })
      .select('+password');
    if (!exists)
      throw new BadRequestException('Email hoặc mật khẩu không đúng!');
    const passwordCheck = await this.bcryptService.comparePassword(
      password,
      exists.password,
    );
    if (!passwordCheck)
      throw new BadRequestException('Email hoặc mật khẩu không đúng!');
    const accessToken = this.jwtService.sign(
      { _id: exists._id },
      { expiresIn: '15m' },
    );
    const refreshToken = this.jwtService.sign(
      { _id: exists._id },
      { expiresIn: '7d' },
    );
    const createRefreshToken = {
      user: exists._id,
      refreshToken,
    };
    await this.refreshTokenModel.create(createRefreshToken);
    return {
      accessToken,
      refreshToken,
    };
  }

  async register(body: RegisterAuthDto, query: TQuery) {
    const exists = await this.userModel.findOne({
      email: body.email,
    });
    if (exists) throw new BadRequestException('Email đã được dùng!');
    return await this.userService.create(body, query);
  }

  async verifyEmail(_id: string, template: string) {
    const exists = await this.userModel.findById(_id);
    if (!exists) throw new BadRequestException('Không tồn tại user này!');
    await this.mailService.send({
      from: 'BOILERPLATE',
      html: template,
      subject: 'Kích hoạt tài khoản của bạn',
      to: exists.email,
    });
    return { message: 'Thành công!' };
  }

  async refreshToken(body: RefreshTokenAuthDto) {
    const exists = await this.refreshTokenModel.findOne({
      refresh_token: body.refreshToken,
      ...(settings.AUTH.BROWSER_ID_CHECK && {
        browserId: body.browserId,
      }),
    });
    if (!exists) throw new BadRequestException('Token không hợp lệ!');
    const accessToken = this.jwtService.sign(
      { _id: exists._id },
      { expiresIn: '15m' },
    );
    const refreshToken = this.jwtService.sign(
      { _id: exists._id },
      { expiresIn: '7d' },
    );
    await this.refreshTokenModel.findByIdAndUpdate(exists._id, {
      refreshToken,
    });
    return {
      accessToken,
      refreshToken,
    };
  }
}
