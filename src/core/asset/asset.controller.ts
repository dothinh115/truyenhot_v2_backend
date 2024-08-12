import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import { TAssetsQuery } from '../utils/model.util';
import { FastifyReply } from 'fastify';
import { Excluded } from '../decorators/excluded-route.decorator';
import { AssetProcessor } from '../bee-queue/asset.processor';

@Controller('asset')
@Excluded()
export class AssetController {
  constructor(private assetProcessor: AssetProcessor) {}

  @Get(':id')
  async find(
    @Param('id') id: string,
    @Query() query: TAssetsQuery,
    @Res() res: FastifyReply,
  ) {
    try {
      const jobData = JSON.stringify({
        id,
        query,
      });
      const job = await this.assetProcessor.addCreateFileJob(jobData);
      const result = await this.assetProcessor.waitForCompletion(job);
      res.type(result.headers['content-type']);
      res.header('content-disposition', result.headers['content-disposition']);
      if (query.cache) {
        res.header('cache-control', result.headers['cache-control']);
      }
      // Check type of result.send
      if (result.send.type === 'Buffer') {
        res.send(Buffer.from(result.send));
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
