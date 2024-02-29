import { Expose, plainToClass } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @Expose()
  @IsNotEmpty({ message: 'Email không được để trống!' })
  email: string;
  @Expose()
  @IsNotEmpty({ message: 'Password không được để trống' })
  password: string;

  static plainToClass<T>(this: new (...arg: any[]) => T, obj: T) {
    return plainToClass(this, obj, { excludeExtraneousValues: true });
  }
}
