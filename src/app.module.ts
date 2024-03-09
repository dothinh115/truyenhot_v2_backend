import { Global, Module } from '@nestjs/common';
import { CategoryModule } from './category/category.module';
import { AuthorModule } from './author/author.module';
import { StoryModule } from './story/story.module';
import { StatusModule } from './status/status.module';
import { ChapterModule } from './chapter/chapter.module';
import { MainModule } from './core/main/main.module';

@Global()
@Module({
  imports: [
    MainModule,
    CategoryModule,
    AuthorModule,
    StoryModule,
    StatusModule,
    ChapterModule,
  ],
})
export class AppModule {}
