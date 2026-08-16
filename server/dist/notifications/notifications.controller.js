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
import { Controller, Get, Put, Post, Param, Body, Inject } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
// No authentication on any route — fully public API
let NotificationsController = class NotificationsController {
    notificationsService;
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    async getAll() {
        return this.notificationsService.findAll();
    }
    async getUnreadCount() {
        return this.notificationsService.getUnreadCount();
    }
    async markAsRead(id) {
        return this.notificationsService.markAsRead(id);
    }
    async markAllAsRead() {
        return this.notificationsService.markAllAsRead();
    }
    // Contact message endpoints
    async createContactMessage(body) {
        return this.notificationsService.createContactMessage(body);
    }
    async getAllContactMessages() {
        return this.notificationsService.getAllContactMessages();
    }
    async markContactAsRead(id) {
        return this.notificationsService.markContactAsRead(id);
    }
};
__decorate([
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getAll", null);
__decorate([
    Get('unread-count'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getUnreadCount", null);
__decorate([
    Put(':id/read'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAsRead", null);
__decorate([
    Put('read-all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAllAsRead", null);
__decorate([
    Post('contact'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "createContactMessage", null);
__decorate([
    Get('contacts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getAllContactMessages", null);
__decorate([
    Put('contacts/:id/read'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markContactAsRead", null);
NotificationsController = __decorate([
    Controller('notifications'),
    __param(0, Inject(NotificationsService)),
    __metadata("design:paramtypes", [typeof (_a = typeof NotificationsService !== "undefined" && NotificationsService) === "function" ? _a : Object])
], NotificationsController);
export { NotificationsController };
//# sourceMappingURL=notifications.controller.js.map