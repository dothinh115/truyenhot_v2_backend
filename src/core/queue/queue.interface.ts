import BeeQueue from 'bee-queue';

export interface IQueue {
  queue: BeeQueue;

  add(data: string): Promise<BeeQueue.Job<void>>;
  complete(job: BeeQueue.Job<any>): Promise<any>;
  process(callback: Function): void;
}
