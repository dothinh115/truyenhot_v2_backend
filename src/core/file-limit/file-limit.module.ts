import { Module } from '@nestjs/common';
import { FileLimitService } from './file-limit.service';
import { FileLimitController } from './file-limit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileLimit } from './entities/file-limit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FileLimit])],
  controllers: [FileLimitController],
  providers: [FileLimitService],
})
export class FileLimitModule {}
