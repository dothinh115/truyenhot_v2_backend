import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class MetaService {
  handleMeta(meta: string[]): ('filterCount' | 'totalCount')[] {
    if (meta.length === 0) return [];

    // Tìm kiếm mục không hợp lệ
    const invalidItem = meta.find(
      (item) => item !== 'filterCount' && item !== 'totalCount' && item !== '*',
    );

    // Nếu có mục không hợp lệ, ném ra ngoại lệ
    if (invalidItem) {
      throw new BadRequestException(
        'meta: chỉ được truyền filterCount hoặc totalCount',
      );
    }

    // Nếu meta bao gồm '*', trả về cả 'filterCount' và 'totalCount'
    if (meta.includes('*')) {
      return ['filterCount', 'totalCount'];
    }

    return meta as ('filterCount' | 'totalCount')[];
  }
}
