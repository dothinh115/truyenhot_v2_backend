import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
@Injectable()
export class BcryptService {
  constructor(private configService: ConfigService) {}

  async hashPassword(password: string) {
    return bcrypt.hashSync(
      password,
      Number(this.configService.get('BCRYPT_LOOPS')),
    );
  }

  async comparePassword(plainPassword: string, hashedPassword: string) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}
