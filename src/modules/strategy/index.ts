import { AuthGuard } from '@nestjs/passport';

export class TokenRequired extends AuthGuard('jwt') {}
