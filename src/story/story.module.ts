import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Story, StorySchema } from './schema/story.schema';
import { StoryController } from './story.controller';
import { StoryService } from './story.service';

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
