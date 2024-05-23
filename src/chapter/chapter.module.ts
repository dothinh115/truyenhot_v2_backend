import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Chapter, ChapterSchema } from './schema/chapter.schema';
import { ChapterController } from './chapter.controller';
import { ChapterService } from './chapter.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Chapter.name,
        schema: ChapterSchema,
      },
    ]),
  ],
  controllers: [ChapterController],
  providers: [ChapterService],
})
export class ChapterModule {}
