import { Expose } from 'class-transformer';

export class UpdateMeDto {
  @Expose()
  password?: string;
}
