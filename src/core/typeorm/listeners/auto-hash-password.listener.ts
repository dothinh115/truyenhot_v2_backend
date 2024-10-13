import { ConfigService } from '@nestjs/config';
import { BcryptService } from 'src/core/common/bcrypt.service';

export const autoHashPassword = (object: any) => {
  if (object.password) {
    const configService = new ConfigService();
    const bcryptService = new BcryptService(configService);
    object.password = bcryptService.hashPassword(object.password);
  }
};
