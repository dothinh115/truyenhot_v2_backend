import { Expose } from 'class-transformer';

export class UpdateSettingDto {
  @Expose()
  defaultRole?: string;
}
