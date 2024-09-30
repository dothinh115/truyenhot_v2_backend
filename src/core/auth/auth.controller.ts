import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { TQuery } from '../utils/model.util';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { FastifyReply } from 'fastify';
import { OAuthLoginDto } from './dto/oauth-login.dto';
import { Excluded } from '../decorators/excluded-route.decorator';

@Controller()
@Excluded()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() body: LoginAuthDto) {
    return this.authService.login(body);
  }
  @Post('register')
  register(@Body() body: RegisterAuthDto, @Query() query: TQuery) {
    return this.authService.register(body, query);
  }

  @Post('refresh-token')
  refreshToken(@Body() body: RefreshTokenDto) {
    return this.authService.refreshToken(body);
  }

  @Post('auth/google/url')
  getAuthUrl(@Body() body: OAuthLoginDto) {
    return this.authService.getAuthUrl(body);
  }

  @Get('auth/google/callback')
  oauthCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: FastifyReply,
  ) {
    return this.authService.oAuthCallback(code, state, res);
  }

  @Get('auth/token')
  getToken(@Query('tokenId') tokenId: string) {
    return this.authService.getToken(tokenId);
  }
}
