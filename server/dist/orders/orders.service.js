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
import { Injectable, BadRequestException, NotFoundException, Inject, } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderStatus } from './schemas/order.schema';
import { Product } from '../products/schemas/product.schema';
import { NotificationsService } from '../notifications/notifications.service';
let OrdersService = class OrdersService {
    orderModel;
    productModel;
    notificationsService;
    constructor(orderModel, productModel, notificationsService) {
        this.orderModel = orderModel;
        this.productModel = productModel;
        this.notificationsService = notificationsService;
    }
    // ── Guest order creation ──────────────────────────────────────────────────
    async create(dto) {
        let totalAmount = 0;
        const processedItems = [];
        for (const item of dto.items) {
            const product = await this.productModel.findById(item.productId);
            if (!product) {
                throw new NotFoundException(`Product "${item.name}" not found`);
            }
            if (product.stock < item.quantity) {
                throw new BadRequestException(`Insufficient stock for "${product.name}". Available: ${product.stock}`);
            }
            const unitPrice = product.isOnSale ? product.salePrice : product.price;
            totalAmount += unitPrice * item.quantity;
            processedItems.push({
                product: product._id,
                name: product.name,
                price: unitPrice,
                quantity: item.quantity,
                color: item.color || '',
                size: item.size || '',
                image: item.image || (product.images?.[0] ?? ''),
            });
            product.stock -= item.quantity;
            product.totalSales = (product.totalSales || 0) + item.quantity;
            await product.save();
        }
        const order = await this.orderModel.create({
            guestName: dto.guestName,
            guestEmail: dto.guestEmail.toLowerCase(),
            items: processedItems,
            totalAmount,
            status: OrderStatus.PENDING,
            shippingAddress: {
                street: dto.shippingAddress.street,
                city: dto.shippingAddress.city,
                province: dto.shippingAddress.province || '',
                postalCode: dto.shippingAddress.postalCode,
                country: dto.shippingAddress.country,
            },
        });
        // Real-time notification for admin
        await this.notificationsService.createAndBroadcast({
            title: '🛒 New Order Placed!',
            message: `Order #${order._id.toString().slice(-6)} by ${dto.guestName} — PKR ${totalAmount.toFixed(0)}`,
            type: 'order',
            link: `/admin/orders`,
        });
        return order;
    }
    // ── Coupon validation ─────────────────────────────────────────────────────
    async validateCoupon(code) {
        // Coupon model removed — always invalid
        throw new BadRequestException('Invalid or expired coupon code');
    }
    // ── Guest order lookup ────────────────────────────────────────────────────
    async findByGuestEmail(email) {
        return this.orderModel
            .find({ guestEmail: email.toLowerCase() })
            .sort({ createdAt: -1 })
            .exec();
    }
    // ── Admin: all orders ─────────────────────────────────────────────────────
    async findAll(status) {
        const filter = {};
        if (status)
            filter.status = status;
        return this.orderModel
            .find(filter)
            .sort({ createdAt: -1 })
            .populate('items.product')
            .exec();
    }
    async findById(id) {
        const order = await this.orderModel
            .findById(id)
            .populate('items.product')
            .exec();
        if (!order)
            throw new NotFoundException('Order not found');
        return order;
    }
    async updateStatus(id, status) {
        const order = await this.orderModel
            .findByIdAndUpdate(id, { status }, { new: true })
            .exec();
        if (!order)
            throw new NotFoundException('Order not found');
        await this.notificationsService.createAndBroadcast({
            title: '📦 Order Status Updated',
            message: `Order #${order._id.toString().slice(-6)} → ${status}`,
            type: 'order',
            link: `/admin/orders`,
        });
        return order;
    }
    // ── Admin metrics ─────────────────────────────────────────────────────────
    async getAdminMetrics() {
        const totalOrders = await this.orderModel.countDocuments();
        const activeOrders = await this.orderModel.countDocuments({
            status: { $in: [OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.SHIPPED] },
        });
        const completedOrders = await this.orderModel.countDocuments({ status: OrderStatus.DELIVERED });
        const canceledOrders = await this.orderModel.countDocuments({ status: OrderStatus.CANCELED });
        const revenueResult = await this.orderModel.aggregate([
            { $match: { status: { $ne: OrderStatus.CANCELED } } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
        ]);
        const totalRevenue = revenueResult[0]?.totalRevenue || 0;
        const monthlyIncome = await this.orderModel.aggregate([
            { $match: { status: { $ne: OrderStatus.CANCELED } } },
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                    sales: { $sum: '$totalAmount' },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const salesGraphData = monthlyIncome.map((item) => ({
            year: item._id.year,
            month: monthNames[item._id.month - 1],
            monthNum: item._id.month,
            sales: item.sales,
        }));
        const bestSellers = await this.productModel
            .find()
            .sort({ totalSales: -1 })
            .limit(5)
            .exec();
        const recentOrders = await this.orderModel
            .find()
            .sort({ createdAt: -1 })
            .limit(5)
            .exec();
        return {
            totalOrders,
            activeOrders,
            completedOrders,
            canceledOrders,
            totalRevenue,
            salesGraphData,
            bestSellers,
            recentOrders,
        };
    }
};
OrdersService = __decorate([
    Injectable(),
    __param(0, InjectModel(Order.name)),
    __param(1, InjectModel(Product.name)),
    __param(2, Inject(NotificationsService)),
    __metadata("design:paramtypes", [Model,
        Model, typeof (_a = typeof NotificationsService !== "undefined" && NotificationsService) === "function" ? _a : Object])
], OrdersService);
export { OrdersService };
//# sourceMappingURL=orders.service.js.map