import { Expose } from 'class-transformer';

export class CreateFileDto {
  @Expose()
  folder: string;
}
