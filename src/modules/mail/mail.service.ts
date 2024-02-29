import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SendMailDto } from './dto/send-mail.dto';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class MailService {
  constructor(private configService: ConfigService) {}

  transporter = nodemailer.createTransport({
    host: this.configService.get('MAIL_HOST'),
    auth: {
      user: this.configService.get('MAIL_USER'),
      pass: this.configService.get('MAIL_PASS'),
    },
  });

  async send(body: SendMailDto) {
    try {
      await this.transporter.sendMail(body);
      return { message: `Gửi email thành công đến ${body.to}` };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
