import { ConfigService } from '@nestjs/config';
import { BcryptService } from 'src/core/common/bcrypt.service';

export const autoHashPassword = (entity: any) => {
  if (entity.password) {
    const configService = new ConfigService();
    const bcryptService = new BcryptService(configService);
    entity.password = bcryptService.hashPassword(entity.password);
  }
};
