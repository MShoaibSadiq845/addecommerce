import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { ContactMessage, ContactMessageDocument } from './schemas/contact-message.schema';
import { NotificationsGateway } from './notifications.gateway';
export declare class NotificationsService {
    private notificationModel;
    private contactMessageModel;
    private readonly gateway;
    constructor(notificationModel: Model<NotificationDocument>, contactMessageModel: Model<ContactMessageDocument>, gateway: NotificationsGateway);
    findAll(): Promise<(import("mongoose").Document<unknown, {}, NotificationDocument, {}, import("mongoose").DefaultSchemaOptions> & Notification & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getUnreadCount(): Promise<{
        count: number;
    }>;
    markAsRead(id: string): Promise<import("mongoose").Document<unknown, {}, NotificationDocument, {}, import("mongoose").DefaultSchemaOptions> & Notification & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    markAllAsRead(): Promise<{
        message: string;
    }>;
    createAndBroadcast(data: {
        title: string;
        message: string;
        type?: string;
        link?: string;
    }): Promise<import("mongoose").Document<unknown, {}, NotificationDocument, {}, import("mongoose").DefaultSchemaOptions> & Notification & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    createContactMessage(data: {
        name: string;
        phone?: string;
        email?: string;
        subject: string;
        message: string;
    }): Promise<import("mongoose").Document<unknown, {}, ContactMessageDocument, {}, import("mongoose").DefaultSchemaOptions> & ContactMessage & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getAllContactMessages(): Promise<(import("mongoose").Document<unknown, {}, ContactMessageDocument, {}, import("mongoose").DefaultSchemaOptions> & ContactMessage & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    markContactAsRead(id: string): Promise<import("mongoose").Document<unknown, {}, ContactMessageDocument, {}, import("mongoose").DefaultSchemaOptions> & ContactMessage & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
