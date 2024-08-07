import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { AssetService } from './asset.service';
import { TAssetsQuery } from '../utils/model.util';
import { FastifyReply } from 'fastify';

@Controller('asset')
export class AssetController {
  constructor(private assetService: AssetService) {}

  @Get(':id')
  find(
    @Param('id') id: string,
    @Query() query: TAssetsQuery,
    @Res() res: FastifyReply,
  ) {
    return this.assetService.find(id, query, res);
  }
}
