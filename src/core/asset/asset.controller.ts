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
import { AssetService } from './asset.service';

@Controller('asset')
@Excluded()
export class AssetController {
  constructor(private assetService: AssetService) {}

  @Get(':id')
  find(
    @Param('id') id: string,
    @Query() query: TAssetsQuery,
    @Res() res: FastifyReply,
  ) {
    return this.assetService.asset(id, query, res);
  }
}
