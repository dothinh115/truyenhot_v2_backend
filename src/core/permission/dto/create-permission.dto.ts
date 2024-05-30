import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class CreatePermissionDto {
  @Expose()
  @IsNotEmpty({ message: 'route không được để trống!' })
  route: string;

  @Expose()
  @IsNotEmpty({ message: 'roles không được để trống!' })
  roles: string[];
}
