import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@/core/user/schema/user.schema';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RefreshToken } from '@/core/auth/schema/refresh-token.schema';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { TQuery } from '@/core/utils/models/query.model';
import { RefreshTokenAuthDto } from './dto/refresh-token-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { BcryptService } from '../main/services/bcrypt.service';
import settings from '@/settings.json';
import { QueryService } from '../main/services/query.service';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshToken>,
    private mailService: MailService,
    private jwtService: JwtService,
    private bcryptService: BcryptService,
    private queryService: QueryService,
  ) {}
  async login(body: LoginAuthDto) {
    try {
      const { email, password } = body;
      const exists = await this.userModel
        .findOne({
          email: email.toLowerCase(),
        })
        .select('+password');
      if (!exists) throw new Error('Email hoặc mật khẩu không đúng!');
      const passwordCheck = await this.bcryptService.comparePassword(
        password,
        exists.password,
      );
      if (!passwordCheck) throw new Error('Email hoặc mật khẩu không đúng!');
      const accessToken = this.jwtService.sign(
        { _id: exists._id },
        { expiresIn: '15m' },
      );
      const refreshToken = this.jwtService.sign(
        { _id: exists._id },
        { expiresIn: '7d' },
      );
      const newRefreshToken = {
        user: exists._id,
        refreshToken,
        ...(settings.AUTH.BROWSER_ID_CHECK && {
          browserId: body.browserId,
        }),
      };
      const find = await this.refreshTokenModel.findOne({
        user: exists._id,
        ...(settings.AUTH.BROWSER_ID_CHECK && {
          browserId: body.browserId,
        }),
      });
      if (find) {
        await this.refreshTokenModel.findByIdAndUpdate(
          find._id,
          newRefreshToken,
        );
      } else await this.refreshTokenModel.create(newRefreshToken);
      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async register(body: RegisterAuthDto, query: TQuery) {
    try {
      const exists = await this.userModel.findOne({
        email: body.email,
      });
      if (exists) throw new Error('Email đã được dùng!');
      const result = await this.userModel.create(body);
      return await this.queryService.handleQuery(
        this.userModel,
        query,
        result._id,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async verifyEmail(_id: string, template: string) {
    try {
      const exists = await this.userModel.findById(_id);
      if (!exists) throw new Error('Không tồn tại user này!');
      await this.mailService.send({
        from: 'BOILERPLATE',
        html: template,
        subject: 'Kích hoạt tài khoản của bạn',
        to: exists.email,
      });
      return { message: 'Thành công!' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async refreshToken(body: RefreshTokenAuthDto) {
    try {
      const exists = await this.refreshTokenModel.findOne({
        refreshToken: body.refreshToken,
        ...(settings.AUTH.BROWSER_ID_CHECK && {
          browserId: body.browserId,
        }),
      });
      if (!exists) throw new Error('Token không hợp lệ!');
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
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
