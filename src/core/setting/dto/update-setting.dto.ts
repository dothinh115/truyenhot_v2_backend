import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class UpdateSettingDto {
  @Expose()
  @IsNotEmpty({ message: 'defaultRole không được để trống!' })
  defaultRole: number;
}
