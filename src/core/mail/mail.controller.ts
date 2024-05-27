import { Controller, Post, UseGuards } from '@nestjs/common';
import { MailService } from './mail.service';
import { SendMailDto } from './dto/send-mail.dto';
import { RolesGuard } from '@/core/guards/role.guard';
import { Fields } from '../decorator/field.decorator';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @UseGuards(RolesGuard)
  @Post()
  sendMail(@Fields() body: SendMailDto) {
    return this.mailService.send(body);
  }
}
