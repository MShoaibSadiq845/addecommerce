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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const order_schema_1 = require("./schemas/order.schema");
const product_schema_1 = require("../products/schemas/product.schema");
const user_schema_1 = require("../users/schemas/user.schema");
const notifications_service_1 = require("../notifications/notifications.service");
const mail_service_1 = require("../mail/mail.service");
const stripe_1 = __importDefault(require("stripe"));
let OrdersService = class OrdersService {
    constructor(orderModel, productModel, userModel, notificationsService, mailService) {
        this.orderModel = orderModel;
        this.productModel = productModel;
        this.userModel = userModel;
        this.notificationsService = notificationsService;
        this.mailService = mailService;
        const stripeKey = process.env.STRIPE_SECRET_KEY ||
            '12345';
        this.stripe = new stripe_1.default(stripeKey, {
            apiVersion: '2025-02-24.acacia',
        });
    }
    async create(dto) {
        console.log('🛒 [OrdersService.create] New order placement initiated for:', dto.guestEmail, `(${dto.guestName})`);
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
        const rawMethod = (dto.paymentMethod || 'COD').toUpperCase();
        const isStripe = rawMethod === 'STRIPE' || rawMethod === 'CARD';
        const paymentMethod = isStripe ? 'Stripe' : 'COD';
        const paymentStatus = isStripe ? 'Pending' : 'Unpaid';
        const order = await this.orderModel.create({
            guestName: dto.guestName,
            guestEmail: dto.guestEmail.toLowerCase(),
            guestPhone: dto.guestPhone || '',
            items: processedItems,
            totalAmount,
            status: order_schema_1.OrderStatus.PENDING,
            paymentMethod,
            paymentStatus,
            shippingAddress: {
                street: dto.shippingAddress.street,
                city: dto.shippingAddress.city,
                province: dto.shippingAddress.province || '',
                postalCode: dto.shippingAddress.postalCode,
                country: dto.shippingAddress.country,
            },
        });
        if (dto.guestPhone && dto.guestEmail) {
            try {
                await this.userModel.updateOne({ email: dto.guestEmail.toLowerCase(), phone: { $in: ['', null, undefined] } }, { $set: { phone: dto.guestPhone } });
            }
            catch (e) {
            }
        }
        console.log('✅ [OrdersService.create] Order successfully saved in database! Order ID:', order._id.toString(), 'Phone:', dto.guestPhone);
        try {
            await this.notificationsService.createAndBroadcast({
                title: '🛒 New Order Placed!',
                message: `Order #${order._id.toString().slice(-6)} by ${dto.guestName} (${paymentMethod}) — Rs ${totalAmount.toFixed(0)}`,
                type: 'order',
                link: `/admin/orders`,
            });
            console.log('📢 [OrdersService.create] Realtime admin notification broadcasted.');
        }
        catch (notifyErr) {
            console.error('⚠️ [OrdersService.create] Notification broadcast error:', notifyErr?.message || notifyErr);
        }
        console.log('📧 [OrdersService.create] Calling MailService.sendOrderConfirmationEmail for:', order.guestEmail);
        try {
            await this.mailService.sendOrderConfirmationEmail(order.guestEmail, order);
        }
        catch (emailErr) {
            console.error('⚠️ [OrdersService.create] Error sending order confirmation email via Resend:', emailErr?.message || emailErr);
        }
        if (isStripe) {
            try {
                const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
                const session = await this.stripe.checkout.sessions.create({
                    customer_email: dto.guestEmail.toLowerCase(),
                    managed_payments: { enabled: false },
                    line_items: processedItems.map((item) => {
                        const hasValidImageUrl = item.image && (item.image.startsWith('http://') || item.image.startsWith('https://'));
                        return {
                            price_data: {
                                currency: 'usd',
                                product_data: {
                                    name: item.name,
                                    images: hasValidImageUrl ? [item.image] : [],
                                },
                                unit_amount: Math.round(item.price * 100),
                            },
                            quantity: item.quantity,
                        };
                    }),
                    mode: 'payment',
                    success_url: `${clientUrl}/order-confirmed?session_id={CHECKOUT_SESSION_ID}&email=${encodeURIComponent(dto.guestEmail)}`,
                    cancel_url: `${clientUrl}/checkout?canceled=true`,
                    metadata: {
                        orderId: order._id.toString(),
                    },
                });
                order.stripeSessionId = session.id;
                await order.save();
                return {
                    ...order.toObject(),
                    stripeUrl: session.url,
                };
            }
            catch (stripeErr) {
                console.error('Stripe Checkout Session Error:', stripeErr?.message || stripeErr);
                throw new common_1.BadRequestException(`Stripe Payment Error: ${stripeErr?.message || 'Failed to create Stripe session'}`);
            }
        }
        return order;
    }
    async verifyStripeSession(sessionId) {
        if (!sessionId) {
            throw new common_1.BadRequestException('Stripe session_id is required');
        }
        try {
            const session = await this.stripe.checkout.sessions.retrieve(sessionId);
            if (session && session.payment_status === 'paid') {
                const orderId = session.metadata?.orderId;
                let order = null;
                if (orderId) {
                    order = await this.orderModel.findById(orderId);
                }
                if (!order) {
                    order = await this.orderModel.findOne({ stripeSessionId: sessionId });
                }
                if (order) {
                    order.paymentStatus = 'Paid';
                    if (session.payment_intent) {
                        order.stripePaymentIntentId = String(session.payment_intent);
                    }
                    await order.save();
                    return { success: true, message: 'Payment confirmed & marked as Paid', order };
                }
            }
            return { success: false, message: 'Session payment not completed yet' };
        }
        catch (err) {
            console.error('Verify Stripe session error:', err);
            throw new common_1.BadRequestException(err?.message || 'Failed to verify Stripe payment');
        }
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
    async findByGuestEmail(email) {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return this.orderModel
            .find({
            guestEmail: email.toLowerCase(),
            $or: [
                { status: { $nin: [order_schema_1.OrderStatus.DELIVERED, order_schema_1.OrderStatus.CANCELED] } },
                {
                    status: order_schema_1.OrderStatus.DELIVERED,
                    deliveredAt: { $gte: twentyFourHoursAgo },
                },
                {
                    status: order_schema_1.OrderStatus.DELIVERED,
                    deliveredAt: { $exists: false },
                    updatedAt: { $gte: twentyFourHoursAgo },
                },
                {
                    status: order_schema_1.OrderStatus.DELIVERED,
                    deliveredAt: null,
                    updatedAt: { $gte: twentyFourHoursAgo },
                },
                {
                    status: order_schema_1.OrderStatus.CANCELED,
                    canceledAt: { $gte: twentyFourHoursAgo },
                },
                {
                    status: order_schema_1.OrderStatus.CANCELED,
                    canceledAt: { $exists: false },
                    updatedAt: { $gte: twentyFourHoursAgo },
                },
                {
                    status: order_schema_1.OrderStatus.CANCELED,
                    canceledAt: null,
                    updatedAt: { $gte: twentyFourHoursAgo },
                },
            ],
        })
            .sort({ createdAt: -1 })
            .exec();
    }
    async findAll(status, search, excludeStatus) {
        const filter = {};
        if (status) {
            filter.status = status;
        }
        else if (excludeStatus) {
            const excludedArray = excludeStatus.split(',').map((s) => s.trim());
            if (excludedArray.length > 1) {
                filter.status = { $nin: excludedArray };
            }
            else {
                filter.status = { $ne: excludedArray[0] };
            }
        }
        if (!search || search.trim() === '') {
            return this.orderModel
                .find(filter)
                .sort({ createdAt: -1 })
                .populate('items.product')
                .exec();
        }
        const cleanSearch = search.trim().replace(/^#/, '');
        const escapedClean = cleanSearch.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const searchRegex = new RegExp(escapedClean, 'i');
        const pipeline = [];
        if (Object.keys(filter).length > 0) {
            pipeline.push({ $match: filter });
        }
        pipeline.push({
            $addFields: {
                _idStr: { $toString: '$_id' },
            },
        });
        const orClauses = [
            { _idStr: { $regex: escapedClean, $options: 'i' } },
            { guestName: searchRegex },
            { guestEmail: searchRegex },
            { guestPhone: searchRegex },
            { paymentMethod: searchRegex },
            { paymentStatus: searchRegex },
            { 'shippingAddress.city': searchRegex },
            { 'shippingAddress.street': searchRegex },
            { 'shippingAddress.province': searchRegex },
            { 'shippingAddress.postalCode': searchRegex },
            { 'items.name': searchRegex },
        ];
        if (/^[0-9a-fA-F]{24}$/.test(cleanSearch)) {
            orClauses.push({ _id: new mongoose_2.Types.ObjectId(cleanSearch) });
        }
        pipeline.push({
            $match: {
                $or: orClauses,
            },
        });
        pipeline.push({ $sort: { createdAt: -1 } });
        const results = await this.orderModel.aggregate(pipeline).exec();
        return this.orderModel.populate(results, { path: 'items.product' });
    }
    async findById(id) {
        const cleanId = id.trim().replace(/^#/, '');
        let order = null;
        if (mongoose_2.Types.ObjectId.isValid(cleanId) && cleanId.length === 24) {
            order = await this.orderModel
                .findById(cleanId)
                .populate('items.product')
                .exec();
        }
        else {
            const escaped = cleanId.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const results = await this.orderModel
                .aggregate([
                { $addFields: { _idStr: { $toString: '$_id' } } },
                { $match: { _idStr: { $regex: escaped + '$', $options: 'i' } } },
                { $limit: 1 },
            ])
                .exec();
            if (results && results.length > 0) {
                order = await this.orderModel.populate(results[0], { path: 'items.product' });
            }
        }
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const plainOrder = order.toObject ? order.toObject() : order;
        if (!plainOrder.guestPhone && plainOrder.guestEmail) {
            try {
                const user = await this.userModel.findOne({ email: plainOrder.guestEmail.toLowerCase() }).select('phone').lean();
                if (user?.phone) {
                    plainOrder.guestPhone = user.phone;
                    await this.orderModel.updateOne({ _id: plainOrder._id }, { $set: { guestPhone: user.phone } }).exec();
                }
            }
            catch (e) {
            }
        }
        return plainOrder;
    }
    async updateStatus(id, status) {
        const order = await this.orderModel.findById(id);
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        order.status = status;
        if (status === order_schema_1.OrderStatus.DELIVERED) {
            if (order.paymentStatus !== 'Paid') {
                order.paymentStatus = 'Paid';
            }
            if (!order.deliveredAt) {
                order.deliveredAt = new Date();
            }
            order.canceledAt = undefined;
        }
        else if (status === order_schema_1.OrderStatus.CANCELED) {
            if (!order.canceledAt) {
                order.canceledAt = new Date();
            }
            order.deliveredAt = undefined;
        }
        else {
            order.deliveredAt = undefined;
            order.canceledAt = undefined;
        }
        await order.save();
        await this.notificationsService.createAndBroadcast({
            title: '📦 Order Status Updated',
            message: `Order #${order._id.toString().slice(-6)} → ${status} (${order.paymentStatus})`,
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
            { $match: { status: { $regex: /^delivered$/i } } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
        ]);
        const totalRevenue = revenueResult[0]?.totalRevenue || 0;
        const monthlyIncome = await this.orderModel.aggregate([
            { $match: { status: { $regex: /^delivered$/i } } },
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
    async sendOrderConfirmationEmail(order) {
        if (!order?.guestEmail)
            return;
        return this.mailService.sendOrderConfirmationEmail(order.guestEmail, order);
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __param(1, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __param(2, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(3, (0, common_1.Inject)(notifications_service_1.NotificationsService)),
    __param(4, (0, common_1.Inject)(mail_service_1.MailService)),
    __metadata("design:paramtypes", [mongoose_2.Model, mongoose_2.Model, mongoose_2.Model, notifications_service_1.NotificationsService, mail_service_1.MailService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map