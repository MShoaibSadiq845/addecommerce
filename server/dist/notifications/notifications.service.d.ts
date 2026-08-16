import { Model } from 'mongoose';
import { NotificationDocument } from './schemas/notification.schema';
import { ContactMessageDocument } from './schemas/contact-message.schema';
import { NotificationsGateway } from './notifications.gateway';
export declare class NotificationsService {
    private notificationModel;
    private contactMessageModel;
    private readonly gateway;
    constructor(notificationModel: Model<NotificationDocument>, contactMessageModel: Model<ContactMessageDocument>, gateway: NotificationsGateway);
    findAll(): Promise<any[]>;
    getUnreadCount(): Promise<{
        count: number;
    }>;
    markAsRead(id: string): Promise<any>;
    markAllAsRead(): Promise<{
        message: string;
    }>;
    createAndBroadcast(data: {
        title: string;
        message: string;
        type?: string;
        link?: string;
    }): Promise<any>;
    createContactMessage(data: {
        name: string;
        email: string;
        subject: string;
        message: string;
    }): Promise<any>;
    getAllContactMessages(): Promise<any[]>;
    markContactAsRead(id: string): Promise<any>;
}
