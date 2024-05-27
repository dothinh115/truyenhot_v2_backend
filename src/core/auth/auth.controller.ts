import { Controller, Post, Query, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { TQuery } from '@/core/utils/models/query.model';
import { RefreshTokenAuthDto } from './dto/refresh-token-auth.dto';
import { Fields } from '../decorator/field.decorator';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  login(@Fields() body: LoginAuthDto) {
    return this.authService.login(body);
  }

  @Post('register')
  register(@Fields() body: RegisterAuthDto, @Query() query: TQuery) {
    return this.authService.register(body, query);
  }

  @Post('refreshtoken')
  refreshToken(@Fields() body: RefreshTokenAuthDto) {
    return this.authService.refreshToken(body);
  }
}
