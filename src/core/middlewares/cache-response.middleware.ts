import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheResponseMiddleware implements NestMiddleware {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  async use(req: FastifyRequest, res: FastifyReply['raw'], next: () => void) {
    const cacheKey = `responseCachedFor:${req.originalUrl}`;
    let cachedResponse = await this.cacheManager.get<string>(cacheKey);
    if (cachedResponse) {
      res
        .setHeader('Content-Type', 'application/json')
        .end(JSON.parse(cachedResponse));
      return;
    }

    next();
  }
}
