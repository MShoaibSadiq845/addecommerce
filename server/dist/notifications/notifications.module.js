var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { Notification, NotificationSchema, } from './schemas/notification.schema';
import { ContactMessage, ContactMessageSchema, } from './schemas/contact-message.schema';
let NotificationsModule = class NotificationsModule {
};
NotificationsModule = __decorate([
    Module({
        imports: [
            MongooseModule.forFeature([
                { name: Notification.name, schema: NotificationSchema },
                { name: ContactMessage.name, schema: ContactMessageSchema },
            ]),
        ],
        controllers: [NotificationsController],
        providers: [NotificationsService, NotificationsGateway],
        exports: [NotificationsService, NotificationsGateway],
    })
], NotificationsModule);
export { NotificationsModule };
//# sourceMappingURL=notifications.module.js.map