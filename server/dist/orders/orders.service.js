"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const notifications_service_1 = require("../notifications/notifications.service");
const stripe_1 = __importDefault(require("stripe"));
const nodemailer = __importStar(require("nodemailer"));
let OrdersService = class OrdersService {
    constructor(orderModel, productModel, notificationsService) {
        this.orderModel = orderModel;
        this.productModel = productModel;
        this.notificationsService = notificationsService;
        const stripeKey = process.env.STRIPE_SECRET_KEY ||
            '12345';
        this.stripe = new stripe_1.default(stripeKey, {
            apiVersion: '2025-02-24.acacia',
        });
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT) || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
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
        console.log('✅ [OrdersService.create] Order successfully saved in database! Order ID:', order._id.toString());
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
        console.log('📧 [OrdersService.create] Calling sendOrderConfirmationEmail for:', order.guestEmail);
        this.sendOrderConfirmationEmail(order);
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
        return order;
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
        const orderShortId = order._id ? order._id.toString().slice(-6).toUpperCase() : 'N/A';
        console.log(`\n======================================================`);
        console.log(`📧 [Nodemailer] Starting confirmation email process for Order #${orderShortId}`);
        console.log(`📧 [Nodemailer] Recipient Email: ${order.guestEmail}`);
        try {
            const emailHost = process.env.EMAIL_HOST;
            const emailPort = Number(process.env.EMAIL_PORT) || 587;
            const emailSecure = process.env.EMAIL_SECURE === 'true';
            const emailUser = process.env.EMAIL_USER;
            const emailPass = process.env.EMAIL_PASS;
            const fromHeader = process.env.EMAIL_FROM || `"FABDECOR" <${emailUser}>`;
            console.log(`📧 [Nodemailer] Checking SMTP Config:`, {
                EMAIL_HOST: emailHost,
                EMAIL_PORT: emailPort,
                EMAIL_SECURE: emailSecure,
                EMAIL_USER: emailUser,
                EMAIL_PASS_CONFIGURED: !!emailPass,
                EMAIL_FROM: fromHeader,
            });
            if (!emailHost || !emailUser || !emailPass) {
                console.error('❌ [Nodemailer] FAILED: EMAIL_HOST, EMAIL_USER or EMAIL_PASS not configured in .env file!');
                console.log(`======================================================\n`);
                return;
            }
            const transporter = nodemailer.createTransport({
                host: emailHost,
                port: emailPort,
                secure: emailSecure,
                auth: {
                    user: emailUser,
                    pass: emailPass,
                },
            });
            const itemsHtml = (order.items || [])
                .map((item) => `

          <tr style="border-bottom: 1px solid #e5e7eb;">

            <td style="padding: 12px 10px; font-size: 14px; color: #1f2937;">

              <strong style="color: #111827;">${item.name}</strong>

              ${item.color || item.size
                ? `<div style="font-size: 12px; color: #6b7280; margin-top: 2px;">${[
                    item.color ? `Color: ${item.color}` : '',
                    item.size ? `Size: ${item.size}` : '',
                ]
                    .filter(Boolean)
                    .join(' | ')}</div>`
                : ''}

            </td>

            <td style="padding: 12px 10px; font-size: 14px; color: #374151; text-align: center;">${item.quantity}</td>

            <td style="padding: 12px 10px; font-size: 14px; color: #374151; text-align: right;">Rs ${Number(item.price).toLocaleString()}</td>

            <td style="padding: 12px 10px; font-size: 14px; color: #111827; font-weight: 600; text-align: right;">Rs ${(Number(item.price) * Number(item.quantity)).toLocaleString()}</td>

          </tr>

        `)
                .join('');
            const itemsText = (order.items || [])
                .map((item) => `- ${item.name}${item.color || item.size ? ` (${[item.color, item.size].filter(Boolean).join(', ')})` : ''} x ${item.quantity} = Rs ${(Number(item.price) * Number(item.quantity)).toLocaleString()}`)
                .join('\n');
            const addressStr = order.shippingAddress
                ? `${order.shippingAddress.street || ''}, ${order.shippingAddress.city || ''}${order.shippingAddress.province ? ', ' + order.shippingAddress.province : ''} ${order.shippingAddress.postalCode || ''}, ${order.shippingAddress.country || ''}`
                : 'N/A';
            const mailOptions = {
                from: fromHeader,
                to: order.guestEmail,
                subject: 'Order Confirmation - FABDECOR',
                text: `Thank you ${order.guestName}!\n\nYour order has been placed successfully.\n\nOrder ID: #${orderShortId}\nPayment Method: ${order.paymentMethod}\nPayment Status: ${order.paymentStatus}\nShipping Address: ${addressStr}\n\nOrder Summary:\n${itemsText}\n\nTotal Amount: Rs ${Number(order.totalAmount).toLocaleString()}\n\nThank you for choosing FABDECOR!`,
                html: `

          <!DOCTYPE html>

          <html>

          <head>

            <meta charset="utf-8">

            <meta name="viewport" content="width=device-width, initial-scale=1.0">

            <title>Order Confirmation - FABDECOR</title>

          </head>

          <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 30px 10px;">

              <tr>

                <td align="center">

                  <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">

                    

                    <!-- Header -->

                    <tr>

                      <td style="background: linear-gradient(135deg, #111827 0%, #1f2937 100%); padding: 32px 24px; text-align: center;">

                        <h1 style="margin: 0; color: #ffffff; font-size: 26px; letter-spacing: 3px; font-weight: 800; text-transform: uppercase;">FABDECOR</h1>

                        <p style="margin: 6px 0 0 0; color: #9ca3af; font-size: 14px; letter-spacing: 1px;">Luxury Furniture & Home Decor</p>

                      </td>

                    </tr>



                    <!-- Body -->

                    <tr>

                      <td style="padding: 32px 28px;">

                        <h2 style="margin: 0 0 12px 0; color: #111827; font-size: 22px; font-weight: 700;">

                          Thank you ${order.guestName}!

                        </h2>

                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">

                          Your order has been placed successfully. We are getting your items ready and will notify you once they ship!

                        </p>



                        <!-- Order Info Card -->

                        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 18px; margin-bottom: 28px;">

                          <table width="100%" cellspacing="0" cellpadding="0" style="font-size: 14px;">

                            <tr>

                              <td style="padding: 4px 0; color: #6b7280; width: 40%;">Order ID:</td>

                              <td style="padding: 4px 0; color: #111827; font-weight: 600;">#${orderShortId}</td>

                            </tr>

                            <tr>

                              <td style="padding: 4px 0; color: #6b7280;">Payment Method:</td>

                              <td style="padding: 4px 0; color: #111827; font-weight: 600;">${order.paymentMethod}</td>

                            </tr>

                            <tr>

                              <td style="padding: 4px 0; color: #6b7280;">Payment Status:</td>

                              <td style="padding: 4px 0; color: #111827; font-weight: 600;">${order.paymentStatus}</td>

                            </tr>

                            <tr>

                              <td style="padding: 4px 0; color: #6b7280; vertical-align: top;">Shipping Address:</td>

                              <td style="padding: 4px 0; color: #111827; font-weight: 500;">${addressStr}</td>

                            </tr>

                          </table>

                        </div>



                        <!-- Items Table -->

                        <h3 style="margin: 0 0 12px 0; color: #111827; font-size: 17px; font-weight: 700; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px;">

                          Order Summary

                        </h3>

                        <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 20px;">

                          <thead>

                            <tr style="background-color: #f9fafb;">

                              <th style="padding: 10px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Item</th>

                              <th style="padding: 10px; text-align: center; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Qty</th>

                              <th style="padding: 10px; text-align: right; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Price</th>

                              <th style="padding: 10px; text-align: right; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Total</th>

                            </tr>

                          </thead>

                          <tbody>

                            ${itemsHtml}

                          </tbody>

                          <tfoot>

                            <tr>

                              <td colspan="3" style="padding: 16px 10px 8px 10px; text-align: right; font-size: 16px; font-weight: 700; color: #111827;">Total Amount:</td>

                              <td style="padding: 16px 10px 8px 10px; text-align: right; font-size: 18px; font-weight: 800; color: #059669;">Rs ${Number(order.totalAmount).toLocaleString()}</td>

                            </tr>

                          </tfoot>

                        </table>



                        <!-- Notice / Support -->

                        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 14px; border-radius: 4px; margin-top: 24px;">

                          <p style="margin: 0; color: #065f46; font-size: 13px; line-height: 1.5;">

                            If you have questions about your order, please reply directly to this email. We are here to help!

                          </p>

                        </div>

                      </td>

                    </tr>



                    <!-- Footer -->

                    <tr>

                      <td style="background-color: #f9fafb; padding: 20px 24px; text-align: center; border-top: 1px solid #e5e7eb;">

                        <p style="margin: 0 0 6px 0; color: #6b7280; font-size: 13px;">&copy; ${new Date().getFullYear()} FABDECOR. All rights reserved.</p>

                        <p style="margin: 0; color: #9ca3af; font-size: 12px;">This is an automated order confirmation email.</p>

                      </td>

                    </tr>



                  </table>

                </td>

              </tr>

            </table>

          </body>

          </html>

        `,
            };
            console.log(`📧 [Nodemailer] Sending mail via SMTP transporter...`);
            const info = await transporter.sendMail(mailOptions);
            console.log(`✅ [Nodemailer] SUCCESS! Order confirmation email sent to: ${order.guestEmail}`);
            console.log(`✅ [Nodemailer] Response info:`, {
                messageId: info.messageId,
                accepted: info.accepted,
                rejected: info.rejected,
                response: info.response,
            });
            console.log(`======================================================\n`);
        }
        catch (emailError) {
            console.error(`❌ [Nodemailer] FAILED to send email to ${order.guestEmail}`);
            console.error(`❌ Error Message:`, emailError?.message || emailError);
            console.error(`❌ Error Code:`, emailError?.code);
            console.error(`❌ Error Response:`, emailError?.response);
            console.error(`❌ Full Error Stack:`, emailError?.stack || emailError);
            console.log(`======================================================\n`);
        }
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