import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { BcryptService } from '../common/bcrypt.service';
import { JwtService } from '@nestjs/jwt';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { QueryService } from '../query/query.service';
import { CustomRequest, TQuery } from '../utils/model.util';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import { LogoutAuthDto } from './dto/logout-auth.dto';

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
      return {
        accessToken,
        refreshToken,
      };
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

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
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
      return { message: 'Logout thành công!' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
