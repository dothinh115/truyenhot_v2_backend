import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { BcryptService } from '../common/bcrypt.service';
import { JwtService } from '@nestjs/jwt';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { QueryService } from '../query/query.service';
import { TQuery } from '../utils/model.util';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private bcryptService: BcryptService,
    private jwtService: JwtService,
    private queryService: QueryService,
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
      const decoded = await this.jwtService.verifyAsync(body.refreshToken);
      const accessToken = this.jwtService.sign(
        { id: decoded.id },
        { expiresIn: '15m' },
      );
      const refreshToken = this.jwtService.sign(
        { id: decoded.id },
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
}
