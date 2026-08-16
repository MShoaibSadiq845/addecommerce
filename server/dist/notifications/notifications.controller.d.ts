import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getAll(): Promise<any>;
    getUnreadCount(): Promise<any>;
    markAsRead(id: string): Promise<any>;
    markAllAsRead(): Promise<any>;
    createContactMessage(body: {
        name: string;
        email: string;
        subject: string;
        message: string;
    }): Promise<any>;
    getAllContactMessages(): Promise<any>;
    markContactAsRead(id: string): Promise<any>;
}
