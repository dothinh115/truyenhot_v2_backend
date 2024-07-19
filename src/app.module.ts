import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { CategoryModule } from './category/category.module';
import { CommonModule } from './core/common/common.module';
import { AuthorModule } from './author/author.module';
import { StoryModule } from './story/story.module';
import { ChapterModule } from './chapter/chapter.module';
@Module({
  imports: [
    CoreModule,
    CategoryModule,
    CommonModule,
    AuthorModule,
    StoryModule,
    ChapterModule,
  ],
})
export class AppModule {}
