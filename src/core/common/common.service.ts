import { Injectable } from '@nestjs/common';

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

  isArray(str: string) {
    const regex = /^([0-9a-zA-Z-]+)(,[0-9a-zA-Z-]+)+$/;
    return regex.test(str);
  }

  generateUsername(name: string) {
    // Chuyển tên thành chữ thường, bỏ dấu và khoảng trắng
    const str = name
      .toLowerCase()
      .normalize('NFD') // Chuẩn hóa Unicode
      .replace(/[đĐ]/g, 'd')
      .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu
      .replace(/\s+/g, ''); // Loại bỏ khoảng trắng

    // Tạo 6 số ngẫu nhiên
    const randomNumber = Math.floor(100000 + Math.random() * 900000);

    // Ghép chuỗi không dấu với số ngẫu nhiên
    return str + randomNumber;
  }
}
