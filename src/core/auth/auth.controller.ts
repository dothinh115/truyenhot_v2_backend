import { Body, Controller, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { TQuery } from '@/core/utils/models/query.model';
import { RefreshTokenAuthDto } from './dto/refresh-token-auth.dto';
import { CustomRequest } from '../utils/models/request.model';
import { RolesGuard } from '../guards/role.guard';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  login(@Body() body: LoginAuthDto, @Req() req: CustomRequest) {
    return this.authService.login(body, req);
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
