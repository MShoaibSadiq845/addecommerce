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
var _a, _b, _c, _d;
import { Controller, Get, Post, Put, Body, Param, Query, Inject, BadRequestException, } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './schemas/order.schema';
// No authentication on any route — fully public API
let OrdersController = class OrdersController {
    ordersService;
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    // Place a guest order
    async createOrder(dto) {
        return this.ordersService.create(dto);
    }
    // Track orders by email
    async getOrdersByEmail(email) {
        if (!email)
            throw new BadRequestException('Email is required');
        return this.ordersService.findByGuestEmail(email);
    }
    // Admin dashboard metrics
    async getAdminMetrics() {
        return this.ordersService.getAdminMetrics();
    }
    // Admin: list all orders
    async getAllOrders(status) {
        return this.ordersService.findAll(status);
    }
    // Public: single order by ID
    async getOrderById(id) {
        return this.ordersService.findById(id);
    }
    // Admin: update order status
    async updateOrderStatus(id, status) {
        return this.ordersService.updateStatus(id, status);
    }
};
__decorate([
    Post(),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof CreateOrderDto !== "undefined" && CreateOrderDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "createOrder", null);
__decorate([
    Get('by-email'),
    __param(0, Query('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrdersByEmail", null);
__decorate([
    Get('metrics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getAdminMetrics", null);
__decorate([
    Get(),
    __param(0, Query('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof OrderStatus !== "undefined" && OrderStatus) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getAllOrders", null);
__decorate([
    Get(':id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrderById", null);
__decorate([
    Put(':id/status'),
    __param(0, Param('id')),
    __param(1, Body('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_d = typeof OrderStatus !== "undefined" && OrderStatus) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateOrderStatus", null);
OrdersController = __decorate([
    Controller('orders'),
    __param(0, Inject(OrdersService)),
    __metadata("design:paramtypes", [typeof (_a = typeof OrdersService !== "undefined" && OrdersService) === "function" ? _a : Object])
], OrdersController);
export { OrdersController };
//# sourceMappingURL=orders.controller.js.map