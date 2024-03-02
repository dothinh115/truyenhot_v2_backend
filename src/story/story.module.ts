import { Module } from '@nestjs/common';
import { StoryService } from './story.service';
import { StoryController } from './story.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Story, StorySchema } from './schema/story.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Story.name,
        schema: StorySchema,
      },
    ]),
  ],
  controllers: [StoryController],
  providers: [StoryService],
})
export class StoryModule {}
