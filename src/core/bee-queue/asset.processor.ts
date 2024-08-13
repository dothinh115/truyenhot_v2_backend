import BeeQueue from 'bee-queue';
import { Injectable } from '@nestjs/common';
import { ASSET_PROCESSOR } from '../utils/constant';
import { AssetService } from '../asset/asset.service';

@Injectable()
export class AssetProcessor {
  private fileQueue: BeeQueue;

  constructor(private assetService: AssetService) {
    this.fileQueue = new BeeQueue(ASSET_PROCESSOR, {
      redis: {
        host: 'localhost',
        port: 6379,
      },
      removeOnSuccess: true,
      removeOnFailure: true,
    });

    this.fileQueue.process(async (job) => {
      //code logic hoặc gọi service ở đây
      return;
    });
  }

  async addCreateFileJob(data: string) {
    const job = this.fileQueue.createJob(data);
    return job.save();
  }

  async waitForCompletion(job: BeeQueue.Job<any>): Promise<{
    type: string;
    headers: {
      'content-disposition': string;
      'content-type': string;
      'cache-control': string;
    };
    send: any;
  }> {
    return new Promise((resolve, reject) => {
      job.on('succeeded', (result) => resolve(result));
      job.on('failed', (err) => reject(err));
    });
  }
}
