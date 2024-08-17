import { Delete, Param } from '@nestjs/common';
import { BaseQueue } from './base-queue';

export class FileDeleteQueue extends BaseQueue {
  constructor() {
    super('file-delete');
    this.process(async (job) => {
      const { id } = job.data;
      //có id rồi sẽ gọi logic delete file ở đây, tốt nhất là viết service riêng rồi gọi
    });
  }
}

//Ví dụ cụ thể ở controller

// @Controller()
export class FileDeleteControllerExample {
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const fileDeleteProcessingQueue = new FileDeleteQueue();
    const job = await fileDeleteProcessingQueue.add(id); //truyền id vào đây để bắt lấy bên trên
    //nếu ko cần chờ thì return ngay ở đây
    /* 
        return {
            message: 'File cần xoá đã được đưa vào hàng chờ và sẽ dc xoá khi hệ thống sẵn sàng!'
        }
    */

    //nếu cần chờ cho job xong mới trả kết quả thì gọi phương thức complete
    const result = await fileDeleteProcessingQueue.complete(job);
    return {
      message: `Đã xoá file có id: ${result.id}`,
    };
  }
}
