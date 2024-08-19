import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserDto {
  @Expose()
  @IsNotEmpty({ message: 'Email không được để trống!' })
  email: string;

  @Expose()
  @IsNotEmpty({ message: 'Password không được để trống!' })
  password: string;

  @Expose()
  @IsOptional()
  username: string;

  @Expose()
  @IsOptional()
  isEditedUsername: boolean;
}
