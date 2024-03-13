import { Expose } from 'class-transformer';
import { IsNotEmpty, ValidateIf } from 'class-validator';
import settings from '@/settings.json';

export class RefreshTokenAuthDto {
  @Expose()
  @IsNotEmpty({ message: 'refresh_token không được để trống! ' })
  refreshToken: string;

  @ValidateIf(() => settings.AUTH.BROWSER_ID_CHECK)
  @Expose()
  @IsNotEmpty({ message: 'browserId không được để trống!' })
  browserId?: string;
}
