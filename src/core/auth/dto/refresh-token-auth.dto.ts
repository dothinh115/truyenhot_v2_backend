import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class RefreshTokenAuthDto {
  @Expose()
  @IsNotEmpty({ message: 'refresh_token không được để trống! ' })
  refreshToken: string;
}
