var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, } from './schemas/notification.schema';
import { ContactMessage, } from './schemas/contact-message.schema';
import { NotificationsGateway } from './notifications.gateway';
let NotificationsService = class NotificationsService {
    notificationModel;
    contactMessageModel;
    gateway;
    constructor(notificationModel, contactMessageModel, gateway) {
        this.notificationModel = notificationModel;
        this.contactMessageModel = contactMessageModel;
        this.gateway = gateway;
    }
    async findAll() {
        return this.notificationModel.find().sort({ createdAt: -1 }).limit(50).exec();
    }
    async getUnreadCount() {
        const count = await this.notificationModel.countDocuments({ isRead: false });
        return { count };
    }
    async markAsRead(id) {
        return this.notificationModel.findByIdAndUpdate(id, { isRead: true }, { new: true });
    }
    async markAllAsRead() {
        await this.notificationModel.updateMany({ isRead: false }, { isRead: true });
        return { message: 'All notifications marked as read' };
    }
    async createAndBroadcast(data) {
        const notification = await this.notificationModel.create(data);
        this.gateway.broadcastNotification(notification);
        return notification;
    }
    // Contact message methods
    async createContactMessage(data) {
        const contactMessage = await this.contactMessageModel.create(data);
        return contactMessage;
    }
    async getAllContactMessages() {
        return this.contactMessageModel.find().sort({ createdAt: -1 }).exec();
    }
    async markContactAsRead(id) {
        return this.contactMessageModel.findByIdAndUpdate(id, { isRead: true }, { new: true });
    }
};
NotificationsService = __decorate([
    Injectable(),
    __param(0, InjectModel(Notification.name)),
    __param(1, InjectModel(ContactMessage.name)),
    __param(2, Inject(NotificationsGateway)),
    __metadata("design:paramtypes", [Model,
        Model, typeof (_a = typeof NotificationsGateway !== "undefined" && NotificationsGateway) === "function" ? _a : Object])
], NotificationsService);
export { NotificationsService };
//# sourceMappingURL=notifications.service.js.map