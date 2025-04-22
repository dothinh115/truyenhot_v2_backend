import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { BcryptService } from '../common/bcrypt.service';
import { JwtService } from '@nestjs/jwt';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { QueryService } from '../query/query.service';
import { TQuery } from '../utils/model.util';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { OAuthLoginDto } from './dto/oauth-login.dto';
import { CommonService } from '../common/common.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private bcryptService: BcryptService,
    private jwtService: JwtService,
    private queryService: QueryService,
    @InjectEntityManager()
    private configService: ConfigService,
    private httpService: HttpService,
    private commonService: CommonService,
  ) {}

  async login(body: LoginAuthDto) {
    try {
      const { email, password } = body;
      const user = await this.userRepo.findOne({
        where: {
          email: email.toLowerCase(),
        },
        select: ['id', 'email', 'password'],
      });

      if (!user) throw new Error('Email hoặc mật khẩu không đúng!');

      const passwordCheck = await this.bcryptService.comparePassword(
        password,
        user.password,
      );

      if (!passwordCheck) throw new Error('Email hoặc mật khẩu không đúng!');

      const accessToken = this.jwtService.sign(
        { id: user.id },
        { expiresIn: '15m' },
      );

      const refreshToken = this.jwtService.sign(
        { id: user.id },
        { expiresIn: '7d' },
      );

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
      const isExists = await this.userRepo.exists({
        where: {
          email: body.email.toLowerCase(),
        },
      });
      if (isExists) throw new Error('Email đã được dùng!');
      return await this.queryService.create({
        repository: this.userRepo,
        body,
        query,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async refreshToken(body: RefreshTokenDto) {
    try {
      const { refreshToken } = body;
      const decoded = await this.jwtService.verifyAsync(refreshToken);
      const accessToken = this.jwtService.sign(
        { id: decoded.id },
        { expiresIn: '15m' },
      );
      return {
        accessToken,
      };
    } catch (error) {
      console.log(error);
      //Xử lý khi token hết hạn
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException('Token đã hết hạn!');
      }
      throw new BadRequestException(error.message);
    }
  }

  async oAuthCallback(access_token: string) {
    try {
      //lấy user info từ oauth
      const userInfoResponse = await this.httpService.axiosRef.get(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      );

      const userInfoFromOAuth = userInfoResponse.data;

      //khi có thông tin user, tiến hành kiểm tra xem email đã được đăng ký trong hệ thống hay chưa

      //nếu chưa có thì lưu lại vào hệ thống
      let user: User = await this.userRepo.findOne({
        where: {
          email: userInfoFromOAuth.email,
        },
      });
      if (!user) {
        let username = this.commonService.generateUsername(
          userInfoFromOAuth.name,
        );
        //tìm xem user đã tồn tại chưa
        let isUsernameExists = await this.userRepo.exists({
          where: {
            username,
          },
        });
        while (isUsernameExists) {
          username = this.commonService.generateUsername(
            userInfoFromOAuth.name,
          );
          isUsernameExists = await this.userRepo.exists({
            where: {
              username,
            },
          });
        }
        const newUser = await this.queryService.create({
          repository: this.userRepo,
          body: {
            email: userInfoFromOAuth.email,
            password: Math.random().toString(),
            username,
          },
          query: null,
        });
        user = newUser.data;
      }

      //sau đó tiến hành cấp accessToken và refreshToken như bình thường
      const accessToken = this.jwtService.sign(
        { id: user.id },
        { expiresIn: '15m' },
      );

      const refreshToken = this.jwtService.sign(
        { id: user.id },
        { expiresIn: '7d' },
      );

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new BadRequestException('Có lỗi xảy ra!');
    }
  }
}
