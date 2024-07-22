import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Cache } from 'cache-manager';
import { FastifyInstance } from 'fastify';

@Injectable()
export class CacheResponseHook {
  constructor(
    private adapterHost: HttpAdapterHost,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    const httpAdapterHost = this.adapterHost.httpAdapter;
    const instane: FastifyInstance = httpAdapterHost.getInstance();
    instane.addHook('onSend', async (request, reply, payload) => {
      const cacheKey = `responseCachedFor:${request.url}`;
      const cachedResponse = await cacheManager.get(cacheKey);
      if (!cachedResponse) {
        await cacheManager.set(cacheKey, JSON.stringify(payload), 5000);
      }
      return payload;
    });
  }
}
