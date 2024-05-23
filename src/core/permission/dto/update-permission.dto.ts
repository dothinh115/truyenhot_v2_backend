import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class UpdatePermissionDto {
  @Expose()
  @IsNotEmpty({ message: 'roles không được để trống!' })
  roles: string[];
}
