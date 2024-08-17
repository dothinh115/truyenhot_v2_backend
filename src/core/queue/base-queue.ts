import BeeQueue from 'bee-queue';
import { IQueue } from './queue.interface';

export class BaseQueue implements IQueue {
  queue: BeeQueue;
  constructor(queueName: string) {
    this.queue = new BeeQueue(queueName, {
      redis: {
        host: 'localhost',
        port: 6379,
      },
      removeOnSuccess: true, //remove khi xong
      removeOnFailure: true, //remove khi fail
    });
  }
  //add job vào queue
  add(data: string): Promise<BeeQueue.Job<any>> {
    const job = this.queue.createJob(data);
    return job.save();
  }

  //đợi cho đến khi xử lý xong job và trả kết quả nếu cần
  complete(job: BeeQueue.Job<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      job.on('succeeded', (result) => resolve(result));
      job.on('failed', (err) => reject(err));
    });
  }

  //process xử lý job
  async process(callback: (job: BeeQueue.Job<any>) => Promise<void>) {
    this.queue.process(async (job) => {
      try {
        await callback(job);
        return;
      } catch (error) {
        console.error('Lỗi khi xử lý job:', error);
        throw error; // quăng lỗi để xử lý với catch block bên ngoài
      }
    });
  }
}
