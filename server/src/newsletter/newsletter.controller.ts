import { Controller, Post, Get, Body, Query, BadRequestException, Inject } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';

@Controller('newsletter')
export class NewsletterController {
  constructor(
    @Inject(NewsletterService)
    private readonly newsletterService: NewsletterService,
  ) {}

  @Post('subscribe')
  async subscribe(@Body() body: any) {
    let email = typeof body === 'string' ? body : (body?.email || '');
    let phone = body?.phone || '';

    // Safeguard in case body was sent as nested { email: { email, phone } }
    if (typeof email === 'object' && email !== null) {
      phone = email.phone || phone;
      email = email.email || '';
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      throw new BadRequestException('Please enter a valid email address.');
    }
    if (!phone || typeof phone !== 'string' || phone.trim().length < 5) {
      throw new BadRequestException('Please enter your phone number.');
    }

    return this.newsletterService.subscribe(email.trim().toLowerCase(), phone.trim());
  }

  @Get('subscribers')
  async getAll(@Query('search') search?: string) {
    return this.newsletterService.getAll(search);
  }
}