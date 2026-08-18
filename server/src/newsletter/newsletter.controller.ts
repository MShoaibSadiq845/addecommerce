import { Controller, Post, Get, Body, Query, BadRequestException, Inject } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';

@Controller('newsletter')
export class NewsletterController {
  constructor(
    @Inject(NewsletterService)
    private readonly newsletterService: NewsletterService,
  ) {}

  @Post('subscribe')
  async subscribe(@Body('email') email: string) {
    if (!email || !email.includes('@')) {
      throw new BadRequestException('A valid email is required.');
    }
    return this.newsletterService.subscribe(email.trim().toLowerCase());
  }

  @Get('subscribers')
  async getAll(@Query('search') search?: string) {
    return this.newsletterService.getAll(search);
  }
}