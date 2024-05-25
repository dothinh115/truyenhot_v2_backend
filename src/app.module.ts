import { Global, Module } from '@nestjs/common';
import { CategoryModule } from './category/category.module';
import { AuthorModule } from './author/author.module';
import { StoryModule } from './story/story.module';
import { StatusModule } from './status/status.module';
import { ChapterModule } from './chapter/chapter.module';

import { CoreModule } from './core/core.module';
import {
  BoostrapService,
  OnBootStrapService,
} from './core/common/bootstrap.service';

@Global()
@Module({
  imports: [
    CoreModule,
    CategoryModule,
    AuthorModule,
    StoryModule,
    StatusModule,
    ChapterModule,
  ],
  providers: [BoostrapService, OnBootStrapService],
})
export class AppModule {}
