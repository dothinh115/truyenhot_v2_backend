import { Controller, Get, Param, Query, Res } from '@nestjs/common';

import { Response } from 'express';
import { AssetsService } from './assets.service';
import { TImageQuery } from '../utils/models/query.model';

@Controller()
export class AssetsController {
  constructor(private assetsService: AssetsService) {}

  @Get('/assets/:id')
  async get(
    @Param('id') id: string,
    @Res() res: Response,
    @Query() query: TImageQuery,
  ) {
    return this.assetsService.get(id, res, query);
  }
}
