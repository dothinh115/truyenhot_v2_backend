import { Injectable } from '@nestjs/common';
import fs from 'fs';

@Injectable()
export class CommonService {
  toSlug(str: string) {
    str = str.toLowerCase();
    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    str = str.replace(/[đĐ]/g, 'd');
    str = str.replace(/([^0-9a-z-\s])/g, '');
    str = str.replace(/(\s+)/g, '-');
    str = str.replace(/-+/g, '-');
    str = str.replace(/^-+|-+$/g, '');
    return str;
  }

  toNonAccented(str: string) {
    str = str.toLowerCase();
    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    str = str.replace(/[đĐ]/g, 'd');
    str = str.replace(/([^0-9a-z-\s])/g, '');
    str = str.replace(/-+/g, '-');
    str = str.replace(/^-+|-+$/g, '');
    return str;
  }

  removeFileOrFolder(path: string, isFolder = false) {
    if (fs.existsSync(path))
      fs.rmSync(path, {
        ...(isFolder && {
          recursive: true,
          force: true,
        }),
      });
  }
}
