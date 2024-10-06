import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { BcryptService } from '../common/bcrypt.service';
import { JwtService } from '@nestjs/jwt';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { QueryService } from '../query/query.service';
import { TQuery } from '../utils/model.util';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResponseService } from '../response/response.service';
import { ConfigService } from '@nestjs/config';
import settings from '../configs/settings.json';
import { FastifyReply } from 'fastify';
import { HttpService } from '@nestjs/axios';
import { OAuthLoginDto } from './dto/oauth-login.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { v4 as uuidv4 } from 'uuid';
import { CommonService } from '../common/common.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private bcryptService: BcryptService,
    private jwtService: JwtService,
    private queryService: QueryService,
    @InjectEntityManager()
    private entityManager: EntityManager,
    private responseService: ResponseService,
    private configService: ConfigService,
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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

      return this.responseService.success({
        accessToken,
        refreshToken,
      });
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
      return this.responseService.success({
        accessToken,
      });
    } catch (error) {
      console.log(error);
      //Xử lý khi token hết hạn
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException('Token đã hết hạn!');
      }
      throw new BadRequestException(error.message);
    }
  }

  getAuthUrl(body: OAuthLoginDto) {
    const state = JSON.stringify(body);
    const clientId = this.configService.get('OAUTH_CLIENT_ID');
    const callBackUri = `${settings.API_URL}/auth/google/callback`;
    const scope = 'email profile';
    return this.responseService.success(
      `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${callBackUri}&response_type=code&scope=${scope}&state=${state}`,
    );
  }

  async oAuthCallback(code: string, state: string, res: FastifyReply) {
    const connection = this.entityManager.connection;
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const userRepo = queryRunner.manager.getRepository(User);
    const body = JSON.parse(state);
    const { redirectTo } = body;

    try {
      const callBackUri = `${settings.API_URL}/auth/google/callback`;
      //lấy token từ oauth
      const tokenResponse = await this.httpService.axiosRef.post(
        'https://oauth2.googleapis.com/token',
        {
          client_id: this.configService.get('OAUTH_CLIENT_ID'),
          client_secret: this.configService.get('OAUTH_SECRET'),
          code,
          grant_type: 'authorization_code',
          redirect_uri: callBackUri,
        },
      );

      const { access_token } = tokenResponse.data;

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
      let user: User = await userRepo.findOne({
        where: {
          email: userInfoFromOAuth.email,
        },
      });
      if (!user) {
        let username = this.commonService.generateUsername(
          userInfoFromOAuth.name,
        );
        //tìm xem user đã tồn tại chưa
        let isUsernameExists = await userRepo.exists({
          where: {
            username,
          },
        });
        while (isUsernameExists) {
          username = this.commonService.generateUsername(
            userInfoFromOAuth.name,
          );
          isUsernameExists = await userRepo.exists({
            where: {
              username,
            },
          });
        }
        const newUser = await this.queryService.create({
          repository: userRepo,
          body: {
            email: userInfoFromOAuth.email,
            password: Math.random().toString(),
            username,
          },
          query: null,
        });
        user = newUser.data.data;
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

      await queryRunner.commitTransaction();
      //sau khi có dc tất cả session thì tiến hành tạo 1 id để trả về cho FE, đồng thời cache lại kết quả để truy xuất nhanh
      const tokenId = uuidv4();
      //chuyển data thành chuỗi để cache
      const data = JSON.stringify({
        accessToken,
        refreshToken,
      });

      //lưu vào cache, sống 10 phút
      await this.cacheManager.set(tokenId, data, 600000);

      const url = new URL(redirectTo);
      url.searchParams.set('tokenId', tokenId);
      const urlString = url.toString();
      //redirect về FE
      res.status(302).header('Location', urlString).send();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const url = new URL(redirectTo);
      url.searchParams.set('error', 'true');
      const urlString = url.toString();
      res.status(302).header('Location', urlString).send();
    } finally {
      await queryRunner.release();
    }
  }

  async getToken(tokenId: string) {
    const cachedData = await this.cacheManager.get<string>(tokenId);
    if (!cachedData)
      throw new BadRequestException('tokenId đã hết hạn hoặc không hợp lệ!');
    const data = JSON.parse(cachedData);
    //xoá trong cache để free bộ nhớ và huỷ dữ liệu về token
    await this.cacheManager.del(tokenId);
    return this.responseService.success(data);
  }
}
