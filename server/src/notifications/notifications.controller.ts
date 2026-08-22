import { Controller, Get, Put, Post, Param, Body, Inject } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

// No authentication on any route — fully public API
@Controller('notifications')
export class NotificationsController {
  constructor(
    @Inject(NotificationsService)
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  async getAll() {
    return this.notificationsService.findAll();
  }

  @Get('unread-count')
  async getUnreadCount() {
    return this.notificationsService.getUnreadCount();
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Put('read-all')
  async markAllAsRead() {
    return this.notificationsService.markAllAsRead();
  }

  // Contact message endpoints
  @Post('contact')
  async createContactMessage(
    @Body() body: { name: string; phone?: string; email?: string; subject: string; message: string },
  ) {
    return this.notificationsService.createContactMessage(body);
  }

  @Get('contacts')
  async getAllContactMessages() {
    return this.notificationsService.getAllContactMessages();
  }

  @Put('contacts/:id/read')
  async markContactAsRead(@Param('id') id: string) {
    return this.notificationsService.markContactAsRead(id);
  }
}
