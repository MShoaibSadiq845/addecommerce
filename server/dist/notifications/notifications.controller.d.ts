import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getAll(): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/notification.schema").NotificationDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/notification.schema").Notification & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getUnreadCount(): Promise<{
        count: number;
    }>;
    markAsRead(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/notification.schema").NotificationDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/notification.schema").Notification & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    markAllAsRead(): Promise<{
        message: string;
    }>;
    createContactMessage(body: {
        name: string;
        email: string;
        subject: string;
        message: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("./schemas/contact-message.schema").ContactMessageDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/contact-message.schema").ContactMessage & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getAllContactMessages(): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/contact-message.schema").ContactMessageDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/contact-message.schema").ContactMessage & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    markContactAsRead(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/contact-message.schema").ContactMessageDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/contact-message.schema").ContactMessage & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
