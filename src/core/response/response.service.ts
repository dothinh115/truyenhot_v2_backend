import { HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class ResponseService {
  success(
    data: any,
    message: string = 'Success',
    statusCode: number = HttpStatus.OK,
  ) {
    return {
      statusCode,
      message,
      data,
    };
  }

  error(
    message: string,
    error: any,
    statusCode: number = HttpStatus.BAD_REQUEST,
  ) {
    return {
      statusCode,
      message,
      error,
    };
  }
}
