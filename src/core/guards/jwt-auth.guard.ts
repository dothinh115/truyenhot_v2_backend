import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    // Nếu không có token hoặc token không hợp lệ, trả về null thay vì quăng lỗi
    if (err || !user) {
      return null;
    }
    return user;
  }
}
