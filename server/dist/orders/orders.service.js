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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const order_schema_1 = require("./schemas/order.schema");
const product_schema_1 = require("../products/schemas/product.schema");
const notifications_service_1 = require("../notifications/notifications.service");
let OrdersService = class OrdersService {
    constructor(orderModel, productModel, notificationsService) {
        this.orderModel = orderModel;
        this.productModel = productModel;
        this.notificationsService = notificationsService;
    }
    async create(dto) {
        let totalAmount = 0;
        const processedItems = [];
        for (const item of dto.items) {
            const product = await this.productModel.findById(item.productId);
            if (!product) {
                throw new common_1.NotFoundException(`Product "${item.name}" not found`);
            }
            if (product.stock < item.quantity) {
                throw new common_1.BadRequestException(`Insufficient stock for "${product.name}". Available: ${product.stock}`);
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
            status: order_schema_1.OrderStatus.PENDING,
            shippingAddress: {
                street: dto.shippingAddress.street,
                city: dto.shippingAddress.city,
                province: dto.shippingAddress.province || '',
                postalCode: dto.shippingAddress.postalCode,
                country: dto.shippingAddress.country,
            },
        });
        await this.notificationsService.createAndBroadcast({
            title: '🛒 New Order Placed!',
            message: `Order #${order._id.toString().slice(-6)} by ${dto.guestName} — PKR ${totalAmount.toFixed(0)}`,
            type: 'order',
            link: `/admin/orders`,
        });
        return order;
    }
    async validateCheckout(dto) {
        if (!dto.items || dto.items.length === 0) {
            throw new common_1.BadRequestException('Cart is empty. Please add items before checking out.');
        }
        for (const item of dto.items) {
            const product = await this.productModel.findById(item.productId);
            if (!product) {
                throw new common_1.NotFoundException(`Product "${item.name || 'item'}" not found or no longer available`);
            }
            if (product.stock < item.quantity) {
                throw new common_1.BadRequestException(`Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}`);
            }
        }
        return {
            success: true,
            message: 'Cart verified successfully. Proceeding to checkout.',
        };
    }
    async validateCoupon(code) {
        throw new common_1.BadRequestException('Invalid or expired coupon code');
    }
    async findByGuestEmail(email) {
        return this.orderModel
            .find({ guestEmail: email.toLowerCase() })
            .sort({ createdAt: -1 })
            .exec();
    }
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
            throw new common_1.NotFoundException('Order not found');
        return order;
    }
    async updateStatus(id, status) {
        const order = await this.orderModel
            .findByIdAndUpdate(id, { status }, { new: true })
            .exec();
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        await this.notificationsService.createAndBroadcast({
            title: '📦 Order Status Updated',
            message: `Order #${order._id.toString().slice(-6)} → ${status}`,
            type: 'order',
            link: `/admin/orders`,
        });
        return order;
    }
    async getAdminMetrics() {
        const totalOrders = await this.orderModel.countDocuments();
        const activeOrders = await this.orderModel.countDocuments({
            status: { $in: [order_schema_1.OrderStatus.PENDING, order_schema_1.OrderStatus.PROCESSING, order_schema_1.OrderStatus.SHIPPED] },
        });
        const completedOrders = await this.orderModel.countDocuments({ status: order_schema_1.OrderStatus.DELIVERED });
        const canceledOrders = await this.orderModel.countDocuments({ status: order_schema_1.OrderStatus.CANCELED });
        const revenueResult = await this.orderModel.aggregate([
            { $match: { status: { $ne: order_schema_1.OrderStatus.CANCELED } } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
        ]);
        const totalRevenue = revenueResult[0]?.totalRevenue || 0;
        const monthlyIncome = await this.orderModel.aggregate([
            { $match: { status: { $ne: order_schema_1.OrderStatus.CANCELED } } },
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
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __param(1, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __param(2, (0, common_1.Inject)(notifications_service_1.NotificationsService)),
    __metadata("design:paramtypes", [mongoose_2.Model, mongoose_2.Model, notifications_service_1.NotificationsService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map