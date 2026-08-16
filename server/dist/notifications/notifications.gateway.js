var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { WebSocketGateway, WebSocketServer, } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';
let NotificationsGateway = class NotificationsGateway {
    server;
    logger = new Logger('NotificationsGateway');
    afterInit(server) {
        this.logger.log('Websocket Gateway Initialized');
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    broadcastNotification(notification) {
        this.server.emit('notification', notification);
        if (notification.type === 'sale') {
            this.server.emit('sale_notification', notification);
        }
        else if (notification.type === 'order') {
            this.server.emit('order_notification', notification);
        }
    }
};
__decorate([
    WebSocketServer(),
    __metadata("design:type", Server)
], NotificationsGateway.prototype, "server", void 0);
NotificationsGateway = __decorate([
    WebSocketGateway({
        cors: {
            origin: '*',
        },
    })
], NotificationsGateway);
export { NotificationsGateway };
//# sourceMappingURL=notifications.gateway.js.map