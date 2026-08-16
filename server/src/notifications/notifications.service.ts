import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';
import {
  ContactMessage,
  ContactMessageDocument,
} from './schemas/contact-message.schema';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    @InjectModel(ContactMessage.name)
    private contactMessageModel: Model<ContactMessageDocument>,
    @Inject(forwardRef(() => NotificationsGateway))
    private readonly gateway: NotificationsGateway,
  ) {}

  async findAll() {
    return this.notificationModel.find().sort({ createdAt: -1 }).limit(50).exec();
  }

  async getUnreadCount() {
    const count = await this.notificationModel.countDocuments({ isRead: false });
    return { count };
  }

  async markAsRead(id: string) {
    return this.notificationModel.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true },
    );
  }

  async markAllAsRead() {
    await this.notificationModel.updateMany({ isRead: false }, { isRead: true });
    return { message: 'All notifications marked as read' };
  }

  async createAndBroadcast(data: {
    title: string;
    message: string;
    type?: string;
    link?: string;
  }) {
    const notification = await this.notificationModel.create(data);
    
    // 🛡️ Safe check to prevent 500 crash if gateway is not yet initialized
    if (this.gateway && typeof this.gateway.broadcastNotification === 'function') {
      this.gateway.broadcastNotification(notification);
    }
    
    return notification;
  }

  // Contact message methods
  async createContactMessage(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) {
    const contactMessage = await this.contactMessageModel.create(data);
    return contactMessage;
  }

  async getAllContactMessages() {
    return this.contactMessageModel.find().sort({ createdAt: -1 }).exec();
  }

  async markContactAsRead(id: string) {
    return this.contactMessageModel.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true },
    );
  }
}