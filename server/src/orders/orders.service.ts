import {

  Injectable,

  BadRequestException,

  NotFoundException,

  Inject,

} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model, Types } from 'mongoose';

import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';

import { Product, ProductDocument } from '../products/schemas/product.schema';

import { User, UserDocument } from '../users/schemas/user.schema';

import { CreateOrderDto } from './dto/create-order.dto';

import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';
import Stripe from 'stripe';

@Injectable()
export class OrdersService {
  private stripe: Stripe;

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(NotificationsService)
    private readonly notificationsService: NotificationsService,
    @Inject(MailService)
    private readonly mailService: MailService,
  ) {

    const stripeKey =

      process.env.STRIPE_SECRET_KEY ||

      '12345';

    this.stripe = new Stripe(stripeKey, {

      apiVersion: '2025-02-24.acacia' as any,
    });
  }



  // ── Create order (COD or Stripe Checkout) ──────────────────────────────

  async create(dto: CreateOrderDto) {

    console.log('🛒 [OrdersService.create] New order placement initiated for:', dto.guestEmail, `(${dto.guestName})`);

    let totalAmount = 0;

    const processedItems: any[] = [];



    for (const item of dto.items) {

      const product = await this.productModel.findById(item.productId);

      if (!product) {

        throw new NotFoundException(`Product "${item.name}" not found`);

      }

      if (product.stock < item.quantity) {

        throw new BadRequestException(

          `Insufficient stock for "${product.name}". Available: ${product.stock}`,

        );

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

      status: OrderStatus.PENDING,

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



    // Sync phone number to user profile if registered and user phone is empty

    if (dto.guestPhone && dto.guestEmail) {

      try {

        await this.userModel.updateOne(

          { email: dto.guestEmail.toLowerCase(), phone: { $in: ['', null, undefined] } },

          { $set: { phone: dto.guestPhone } },

        );

      } catch (e) {

        // non-blocking

      }

    }



    console.log('✅ [OrdersService.create] Order successfully saved in database! Order ID:', order._id.toString(), 'Phone:', dto.guestPhone);



    // Real-time notification for admin

    try {

      await this.notificationsService.createAndBroadcast({

        title: '🛒 New Order Placed!',

        message: `Order #${order._id.toString().slice(-6)} by ${dto.guestName} (${paymentMethod}) — Rs ${totalAmount.toFixed(0)}`,

        type: 'order',

        link: `/admin/orders`,

      });

      console.log('📢 [OrdersService.create] Realtime admin notification broadcasted.');

    } catch (notifyErr: any) {

      console.error('⚠️ [OrdersService.create] Notification broadcast error:', notifyErr?.message || notifyErr);

    }



    // Send confirmation email to user via Resend MailService
    console.log('📧 [OrdersService.create] Calling MailService.sendOrderConfirmationEmail for:', order.guestEmail);
    try {
      await this.mailService.sendOrderConfirmationEmail(order.guestEmail, order);
    } catch (emailErr: any) {
      console.error('⚠️ [OrdersService.create] Error sending order confirmation email via Resend:', emailErr?.message || emailErr);
    }



    // If Stripe payment selected, create a Stripe Checkout Session

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

      } catch (stripeErr: any) {

        console.error('Stripe Checkout Session Error:', stripeErr?.message || stripeErr);

        throw new BadRequestException(`Stripe Payment Error: ${stripeErr?.message || 'Failed to create Stripe session'}`);

      }

    }



    return order;

  }



  // ── Verify Stripe Checkout session & update paymentStatus to Paid ─────────

  async verifyStripeSession(sessionId: string) {

    if (!sessionId) {

      throw new BadRequestException('Stripe session_id is required');

    }



    try {

      const session = await this.stripe.checkout.sessions.retrieve(sessionId);

      if (session && session.payment_status === 'paid') {

        const orderId = session.metadata?.orderId;

        let order: OrderDocument | null = null;



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

    } catch (err: any) {

      console.error('Verify Stripe session error:', err);

      throw new BadRequestException(err?.message || 'Failed to verify Stripe payment');

    }

  }



  // ── Checkout validation ───────────────────────────────────────────────────

  async validateCheckout(dto: { items: Array<{ productId: string; quantity: number; name?: string }> }) {

    if (!dto.items || dto.items.length === 0) {

      throw new BadRequestException('Cart is empty. Please add items before checking out.');

    }



    for (const item of dto.items) {

      const product = await this.productModel.findById(item.productId);

      if (!product) {

        throw new NotFoundException(`Product "${item.name || 'item'}" not found or no longer available`);

      }

      if (product.stock < item.quantity) {

        throw new BadRequestException(

          `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}`,

        );

      }

    }



    return {

      success: true,

      message: 'Cart verified successfully. Proceeding to checkout.',

    };

  }



  // ── Guest order lookup (excludes Delivered & Canceled orders older than 24 hours) ────
  async findByGuestEmail(email: string) {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    return this.orderModel
      .find({
        guestEmail: email.toLowerCase(),
        $or: [
          // Active orders (Pending, Processing, Shipped)
          { status: { $nin: [OrderStatus.DELIVERED, OrderStatus.CANCELED] } },
          // Delivered orders delivered within the last 24 hours
          {
            status: OrderStatus.DELIVERED,
            deliveredAt: { $gte: twentyFourHoursAgo },
          },
          // Fallback for Delivered records without deliveredAt: check updatedAt within 24h
          {
            status: OrderStatus.DELIVERED,
            deliveredAt: { $exists: false },
            updatedAt: { $gte: twentyFourHoursAgo },
          },
          {
            status: OrderStatus.DELIVERED,
            deliveredAt: null,
            updatedAt: { $gte: twentyFourHoursAgo },
          },
          // Canceled orders canceled within the last 24 hours
          {
            status: OrderStatus.CANCELED,
            canceledAt: { $gte: twentyFourHoursAgo },
          },
          // Fallback for Canceled records without canceledAt: check updatedAt within 24h
          {
            status: OrderStatus.CANCELED,
            canceledAt: { $exists: false },
            updatedAt: { $gte: twentyFourHoursAgo },
          },
          {
            status: OrderStatus.CANCELED,
            canceledAt: null,
            updatedAt: { $gte: twentyFourHoursAgo },
          },
        ],
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAll(status?: OrderStatus, search?: string, excludeStatus?: string) {
    const filter: any = {};

    if (status) {
      filter.status = status;
    } else if (excludeStatus) {
      const excludedArray = excludeStatus.split(',').map((s) => s.trim());
      if (excludedArray.length > 1) {
        filter.status = { $nin: excludedArray };
      } else {
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

    const pipeline: any[] = [];

    // Filter by status / excludeStatus first
    if (Object.keys(filter).length > 0) {
      pipeline.push({ $match: filter });
    }

    // Convert _id to string for database-level substring & regex search on Order IDs
    pipeline.push({
      $addFields: {
        _idStr: { $toString: '$_id' },
      },
    });

    const orClauses: any[] = [
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
      orClauses.push({ _id: new Types.ObjectId(cleanSearch) });
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

  async findById(id: string) {
    const cleanId = id.trim().replace(/^#/, '');
    let order: any = null;

    if (Types.ObjectId.isValid(cleanId) && cleanId.length === 24) {
      order = await this.orderModel
        .findById(cleanId)
        .populate('items.product')
        .exec();
    } else {
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

    if (!order) throw new NotFoundException('Order not found');

    const plainOrder = order.toObject ? order.toObject() : order;
    if (!plainOrder.guestPhone && plainOrder.guestEmail) {
      try {
        const user = await this.userModel.findOne({ email: plainOrder.guestEmail.toLowerCase() }).select('phone').lean();
        if (user?.phone) {
          plainOrder.guestPhone = user.phone;
          await this.orderModel.updateOne({ _id: plainOrder._id }, { $set: { guestPhone: user.phone } }).exec();
        }
      } catch (e) {
        // ignore
      }
    }

    return plainOrder;
  }

  // ── Admin: update order status + Auto-update COD paymentStatus to Paid ──
  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException('Order not found');

    order.status = status;

    if (status === OrderStatus.DELIVERED) {
      if (order.paymentStatus !== 'Paid') {
        order.paymentStatus = 'Paid';
      }
      if (!order.deliveredAt) {
        order.deliveredAt = new Date();
      }
      order.canceledAt = undefined;
    } else if (status === OrderStatus.CANCELED) {
      if (!order.canceledAt) {
        order.canceledAt = new Date();
      }
      order.deliveredAt = undefined;
    } else {
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



  // ── Admin metrics ─────────────────────────────────────────────────────────

  async getAdminMetrics() {

    const totalOrders = await this.orderModel.countDocuments();

    const activeOrders = await this.orderModel.countDocuments({

      status: { $in: [OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.SHIPPED] },

    });

    const completedOrders = await this.orderModel.countDocuments({ status: OrderStatus.DELIVERED });

    const canceledOrders = await this.orderModel.countDocuments({ status: OrderStatus.CANCELED });



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



  // ── Send order confirmation email via Resend MailService ───────────────────
  async sendOrderConfirmationEmail(order: any) {
    if (!order?.guestEmail) return;
    return this.mailService.sendOrderConfirmationEmail(order.guestEmail, order);
  }
}