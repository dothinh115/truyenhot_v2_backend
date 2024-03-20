import { Body, Controller, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { TQuery } from '@/core/utils/models/query.model';
import { RefreshTokenAuthDto } from './dto/refresh-token-auth.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  login(@Body() body: LoginAuthDto) {
    return this.authService.login(body);
  }

  @Post('register')
  register(@Body() body: RegisterAuthDto, @Query() query: TQuery) {
    return this.authService.register(body, query);
  }

  @Post('refreshtoken')
  refreshToken(@Body() body: RefreshTokenAuthDto) {
    return this.authService.refreshToken(body);
  }
}
