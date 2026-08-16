"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notification_schema_1 = require("./schemas/notification.schema");
const contact_message_schema_1 = require("./schemas/contact-message.schema");
const notifications_gateway_1 = require("./notifications.gateway");
let NotificationsService = class NotificationsService {
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
        if (this.gateway && typeof this.gateway.broadcastNotification === 'function') {
            this.gateway.broadcastNotification(notification);
        }
        return notification;
    }
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
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_schema_1.Notification.name)),
    __param(1, (0, mongoose_1.InjectModel)(contact_message_schema_1.ContactMessage.name)),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => notifications_gateway_1.NotificationsGateway))),
    __metadata("design:paramtypes", [mongoose_2.Model, mongoose_2.Model, notifications_gateway_1.NotificationsGateway])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map