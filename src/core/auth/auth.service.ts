import { BadRequestException, Injectable } from '@nestjs/common';
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
import { RefreshToken } from './entities/refresh-token.entity';
import { LogoutAuthDto } from './dto/logout-auth.dto';
import { ResponseService } from '../response/response.service';
import { ConfigService } from '@nestjs/config';
import settings from '../configs/settings.json';
import { FastifyReply } from 'fastify';
import { HttpService } from '@nestjs/axios';
import { OAuthLoginDto } from './dto/oauth-login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private bcryptService: BcryptService,
    private jwtService: JwtService,
    private queryService: QueryService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepo: Repository<RefreshToken>,
    @InjectEntityManager() private entityManager: EntityManager,
    private responseService: ResponseService,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  async login(body: LoginAuthDto) {
    const connection = this.entityManager.connection;
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const refreshTokenRepo = queryRunner.manager.getRepository(RefreshToken);
    try {
      const { email, password, clientId } = body;
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

      const expiredDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      //xoá token cũ của clientId này
      await refreshTokenRepo.delete({ clientId });

      //lưu refreshToken vào db để kiểm tra lại
      const newRefreshToken = refreshTokenRepo.create({
        clientId,
        refreshToken,
        expiredDate,
      });
      await refreshTokenRepo.save(newRefreshToken);
      await queryRunner.commitTransaction();
      return this.responseService.success({
        accessToken,
        refreshToken,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
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
      const { clientId, refreshToken } = body;
      const decoded = await this.jwtService.verifyAsync(refreshToken);
      //kiểm tra refreshToken và clientId có hợp lệ
      const refToken = await this.refreshTokenRepo.findOne({
        where: {
          refreshToken,
        },
      });
      //nếu ko có thì quăng lỗi
      if (!refToken) throw new Error('Không có token trong hệ thống');
      //nếu có thì so sánh tiếp với clientId
      if (refToken.clientId !== clientId)
        throw new Error('ClientId không hợp lệ!');

      const accessToken = this.jwtService.sign(
        { id: decoded.id },
        { expiresIn: '15m' },
      );
      const newRefreshToken = this.jwtService.sign(
        { id: decoded.id },
        { expiresIn: '7d' },
      );

      const expiredDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      //sau khi tạo ra refreshToken mới thì update lại
      refToken.refreshToken = newRefreshToken;
      refToken.expiredDate = expiredDate;
      await this.refreshTokenRepo.save(refToken);

      return this.responseService.success({
        accessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      //Xử lý khi token hết hạn
      if (error.name === 'TokenExpiredError') {
        await this.refreshTokenRepo.delete({
          refreshToken: body.refreshToken,
        });
        throw new BadRequestException('Token đã hết hạn!');
      }
      throw new BadRequestException(error.message);
    }
  }

  async logout(body: LogoutAuthDto) {
    try {
      const { refreshToken } = body;
      const refToken = await this.refreshTokenRepo.findOne({
        where: {
          refreshToken,
        },
      });
      if (!refToken) throw new Error('Token không hợp lệ!');
      await this.refreshTokenRepo.delete({ refreshToken });

      return this.responseService.success({ message: 'Logout thành công!' });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  getAuthUrl(body: OAuthLoginDto) {
    const { clientId: visitorId } = body;
    const clientId = this.configService.get('OAUTH_CLIENT_ID');
    const callBackUri = `${settings.API_URL}/auth/google/callback`;
    const scope = 'email profile';
    return this.responseService.success(
      `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${callBackUri}&response_type=code&scope=${scope}&state=${visitorId}`,
    );
  }

  async oAuthCallback(code: string, state: string, res: FastifyReply) {
    const connection = this.entityManager.connection;
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const userRepo = queryRunner.manager.getRepository(User);
    const refreshTokenRepo = queryRunner.manager.getRepository(RefreshToken);
    try {
      const clientId = state;
      const callBackUri = `${settings.API_URL}/auth/google/callback`;

      console.log('fetch token', {
        client_id: this.configService.get('OAUTH_CLIENT_ID'),
        client_secret: this.configService.get('OAUTH_SECRET'),
        code,
        grant_type: 'authorization_code',
        redirect_uri: callBackUri,
      });
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
      console.log('fetch user');

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

      //khi có thông tin user, tiến hành kiểm tra xem emai đã được đăng ký trong hệ thống hay chưa
      const exists = await userRepo.findOne({
        where: {
          email: userInfoFromOAuth.email,
        },
      });

      //nếu chưa có thì lưu lại vào hệ thống
      let user: User;
      if (!exists) {
        user = userRepo.create({
          email: userInfoFromOAuth.email,
          password: Math.random().toString(),
        });
        await userRepo.save(user);
      } else {
        //nếu có rồi thì phải lấy dc id của user đó ra
        user = exists;
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

      const expiredDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      //xoá token cũ của clientId này
      await this.refreshTokenRepo.delete({ clientId });

      //lưu refreshToken vào db để kiểm tra lại
      const newRefreshToken = refreshTokenRepo.create({
        clientId,
        refreshToken,
        expiredDate,
      });
      await refreshTokenRepo.save(newRefreshToken);
      await queryRunner.commitTransaction();
      res.type('text/html');
      res.send(`
      <html>
        <body>
          <script>
            
            window.opener.postMessage({ accessToken: "${accessToken}", refreshToken: "${refreshToken}"  }, "http://localhost:3000/login");
            window.close();
          </script>
        </body>
      </html>
    `);
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }
}
