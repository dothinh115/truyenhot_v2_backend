import { Injectable } from '@nestjs/common';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Story } from 'src/story/entities/story.entity';
import { Repository } from 'typeorm';
import { Chapter } from './entities/chapter.entity';
import { QueryService } from 'src/core/query/query.service';
import { TQuery } from 'src/core/utils/model.util';

@Injectable()
export class ChapterService {
  constructor(
    @InjectRepository(Story) private storyRepo: Repository<Story>,
    @InjectRepository(Chapter) private chapterRepo: Repository<Chapter>,
    private queryService: QueryService,
  ) {}
  create(createChapterDto: CreateChapterDto) {
    return 'This action adds a new chapter';
  }

  process = 0;
  maxProcess = 20;
  allChapters = 0;
  done = 0;

  // async convert() {
  //   this.allChapters = await this.chapterModel.find().estimatedDocumentCount();
  //   const totalStories = await this.storyModel.find().estimatedDocumentCount();
  //   const perPage = 10;
  //   const totalPages = Math.ceil(totalStories / perPage);
  //   let currentPage = 1;
  //   const promises = [];
  //   while (totalPages >= currentPage) {
  //     let stories = await this.storyModel
  //       .find()
  //       .skip((currentPage - 1) * perPage)
  //       .limit(perPage);

  //     for (const story of stories) {
  //       while (this.process > this.maxProcess) {
  //         await new Promise((resolve) => setTimeout(resolve, 500));
  //       }
  //       this.process++;
  //       promises.push(await this.handlePerStory(story));
  //       this.process--;
  //     }
  //     stories = [];
  //     currentPage++;
  //   }
  // }

  // async handlePerStory(story: any) {
  //   const totalChapters = await this.chapterModel
  //     .find({
  //       story: story._id,
  //     })
  //     .countDocuments();
  //   const perPage = 100;
  //   const totalPages = Math.ceil(totalChapters / perPage);
  //   let currentPage = 1;
  //   while (totalPages >= currentPage) {
  //     await this.handlePerChapter(currentPage, story._id);
  //     currentPage++;
  //   }
  // }

  // async handlePerChapter(currentPage: number, storyId: number) {
  //   const perPage = 100;
  //   let chapters = await this.chapterModel
  //     .find({
  //       story: storyId,
  //     })
  //     .skip((currentPage - 1) * perPage)
  //     .limit(perPage);
  //   let newChapters = [];
  //   for (const chapter of chapters) {
  //     const newChapter = this.chapterRepo.create({
  //       content: chapter.content || '',
  //       name: chapter.name || '',
  //       story: { id: chapter.story },
  //       title: chapter.title || '',
  //     });
  //     newChapters.push(newChapter);
  //     this.done++;
  //   }
  //   await this.chapterRepo.save(newChapters);
  //   console.log(`${this.done}/${this.allChapters}`);
  //   newChapters = [];
  //   chapters = [];
  // }

  async find(query: TQuery) {
    return await this.queryService.query({
      repository: this.chapterRepo,
      query,
    });
  }

  update(id: number, updateChapterDto: UpdateChapterDto) {
    return `This action updates a #${id} chapter`;
  }

  remove(id: number) {
    return `This action removes a #${id} chapter`;
  }
}
