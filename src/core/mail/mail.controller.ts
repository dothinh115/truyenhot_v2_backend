import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { MailService } from './mail.service';
import { SendMailDto } from './dto/send-mail.dto';
import { RolesGuard } from '@/core/guards/roles.guard';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @UseGuards(RolesGuard)
  @Post()
  sendMail(@Body() body: SendMailDto) {
    return this.mailService.send(body);
  }
}
