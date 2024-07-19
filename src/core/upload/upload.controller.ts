import { Controller } from '@nestjs/common';
import { UploadService } from './upload.service';

@Controller()
export class UploadController {
  constructor(private uploadService: UploadService) {}
}
