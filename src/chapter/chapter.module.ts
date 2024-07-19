import { Module } from '@nestjs/common';
import { ChapterService } from './chapter.service';
import { ChapterController } from './chapter.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Story } from 'src/story/entities/story.entity';
import { Chapter } from './entities/chapter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Story, Chapter])],
  controllers: [ChapterController],
  providers: [ChapterService],
})
export class ChapterModule {}
