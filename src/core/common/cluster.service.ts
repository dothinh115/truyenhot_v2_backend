import { Injectable } from '@nestjs/common';
import cluster, { Address, Worker } from 'cluster'; // Import Worker từ cluster
import * as os from 'os';
const numCPUs = 5;
@Injectable()
export class ClusterService {
  static clusterize(callback: Function) {
    if (cluster.isPrimary) {
      console.log(`Master server started on ${process.pid}`);
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork({ PORT: 4567 + i });
      }
      cluster.on('exit', (worker: Worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Restarting`);
        cluster.fork(); // Khởi động lại worker process với PORT đã sử dụng trước đó
      });
    } else {
      console.log(`Cluster server started on ${process.pid}`);
      callback(process.env.PORT);
    }
  }
}
