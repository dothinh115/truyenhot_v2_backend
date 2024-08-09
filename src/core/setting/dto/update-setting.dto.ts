import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateSettingDto {
  @Expose()
  @IsNotEmpty({ message: 'defaultRole không được để trống!' })
  defaultRole: number;

  @Expose()
  @IsOptional()
  duplicateFileCheck: boolean;
}
