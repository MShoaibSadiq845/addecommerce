import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { NotificationsService } from '../notifications/notifications.service';
import Stripe from 'stripe';
import * as nodemailer from 'nodemailer';

@Injectable()
export class OrdersService {
  private stripe: Stripe;
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @Inject(NotificationsService)
    private readonly notificationsService: NotificationsService,
  ) {
    const stripeKey = process.env.STRIPE_SECRET_KEY || '12345';
    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2025-02-24.acacia' as any,
    });

    // Explicitly configure Port 587 & STARTTLS to avoid Railway SMTP port blocks
    this.transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com', // Brevo ka SMTP host
      port: 465,
      secure: true, // port 587 ke liye false hi rahega
      auth: {
        user: process.env.BREVO_USER, // Aapka Brevo account email / SMTP login
        pass: process.env.BREVO_PASS, // Brevo dashboard se mili hui SMTP Master Password / Key
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 20000, // 20 seconds timeout limit
      greetingTimeout: 20000,
      socketTimeout: 20000,
    });

    console.log('------------------------------------------------------');
    console.log('🚀 [OrdersService] Transporter Initialized Successfully!');
    console.log(`📡 SMTP Host       : smtp-relay.brevo.com (Port: 587)`);
    console.log(`👤 Brevo User (ENV): ${process.env.BREVO_USER ? process.env.BREVO_USER : '⚠️ [NOT SET / UNDEFINED]'}`);
    console.log(`🔑 Brevo Pass (ENV): ${process.env.BREVO_PASS ? '****** (Key configured)' : '⚠️ [NOT SET / UNDEFINED]'}`);
    console.log('------------------------------------------------------');
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

    console.log('✅ [OrdersService.create] Order successfully saved in database! Order ID:', order._id.toString());

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

    // Send confirmation email to user in the background (Non-blocking)
    console.log('📧 [OrdersService.create] Dispatching sendOrderConfirmationEmail in background for:', order.guestEmail);
    this.sendOrderConfirmationEmail(order);

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

  // ── Guest order lookup ────────────────────────────────────────────────    
  async findByGuestEmail(email: string) {
    return this.orderModel
      .find({ guestEmail: email.toLowerCase() })
      .sort({ createdAt: -1 })
      .exec();
  }

  // ── Admin: all orders ─────────────────────────────────────────────────────
  async findAll(status?: OrderStatus) {
    const filter: any = {};
    if (status) filter.status = status;
    return this.orderModel
      .find(filter)
      .sort({ createdAt: -1 })
      .populate('items.product')
      .exec();
  }

  async findById(id: string) {
    const order = await this.orderModel
      .findById(id)
      .populate('items.product')
      .exec();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  // ── Admin: update order status + Auto-update COD paymentStatus to Paid ──
  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException('Order not found');

    order.status = status;

    if (status === OrderStatus.DELIVERED && order.paymentStatus !== 'Paid') {
      order.paymentStatus = 'Paid';
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

  // ── Send order confirmation email via Nodemailer (Background Execution) ──
  async sendOrderConfirmationEmail(order: any) {
    const orderShortId = order._id ? order._id.toString().slice(-6).toUpperCase() : 'N/A';
    console.log(`\n======================================================`);
    console.log(`📧 [Nodemailer] Starting confirmation email process for Order #${orderShortId}`);
    console.log(`📧 [Nodemailer] Recipient Email: ${order.guestEmail}`);

    try {
      const emailUser = process.env.BREVO_USER;
      const emailPass = process.env.BREVO_PASS;

      // Brevo Sender Email: Must be a verified sender in Brevo Dashboard (e.g. your Brevo login email)
      const senderEmail = process.env.BREVO_SENDER_EMAIL || 'sadiqshoaibbilal9140@gmail.com';
      const fromHeader = process.env.EMAIL_FROM || `"FABDECOR" <${senderEmail}>`;

      console.log(`📤 [Nodemailer] From Header     : ${fromHeader}`);
      console.log(`📥 [Nodemailer] To Recipient    : ${order.guestEmail}`);

      if (!emailUser || !emailPass) {
        console.error('❌ [Nodemailer] FAILED: BREVO_USER or BREVO_PASS not configured in .env file!');
        console.log(`======================================================\n`);
        return;
      }

      // Reusing the initialized class-level transporter with explicit port settings
      const transporter = this.transporter;

      const itemsHtml = (order.items || [])
        .map(
          (item: any) => `
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
              : ''
            }
            </td>
            <td style="padding: 12px 10px; font-size: 14px; color: #374151; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px 10px; font-size: 14px; color: #374151; text-align: right;">Rs ${Number(item.price).toLocaleString()}</td>
            <td style="padding: 12px 10px; font-size: 14px; color: #111827; font-weight: 600; text-align: right;">Rs ${(Number(item.price) * Number(item.quantity)).toLocaleString()}</td>
          </tr>
        `,
        )
        .join('');

      const itemsText = (order.items || [])
        .map(
          (item: any) =>
            `- ${item.name}${item.color || item.size ? ` (${[item.color, item.size].filter(Boolean).join(', ')})` : ''} x ${item.quantity} = Rs ${(Number(item.price) * Number(item.quantity)).toLocaleString()}`,
        )
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
                    <tr>
                      <td style="background: linear-gradient(135deg, #111827 0%, #1f2937 100%); padding: 32px 24px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 26px; letter-spacing: 3px; font-weight: 800; text-transform: uppercase;">FABDECOR</h1>
                        <p style="margin: 6px 0 0 0; color: #9ca3af; font-size: 14px; letter-spacing: 1px;">Luxury Furniture & Home Decor</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 32px 28px;">
                        <h2 style="margin: 0 0 12px 0; color: #111827; font-size: 22px; font-weight: 700;">
                          Thank you ${order.guestName}!
                        </h2>
                        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                          Your order has been placed successfully. We are getting your items ready and will notify you once they ship!
                        </p>
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
                        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 14px; border-radius: 4px; margin-top: 24px;">
                          <p style="margin: 0; color: #065f46; font-size: 13px; line-height: 1.5;">
                            If you have questions about your order, please reply directly to this email. We are here to help!
                          </p>
                        </div>
                      </td>
                    </tr>
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

      console.log(`📧 [Nodemailer] Sending mail via transporter in background...`);
      transporter.sendMail(mailOptions)
        .then((info) => {
          console.log(`✅ [Nodemailer] SUCCESS! Order confirmation email sent to: ${order.guestEmail}`);
          console.log(`✅ [Nodemailer] Response info:`, {
            messageId: info.messageId,
            accepted: info.accepted,
            rejected: info.rejected,
            response: info.response,
          });
          console.log(`======================================================\n`);
        })
        .catch((emailError: any) => {
          console.error(`❌ [Nodemailer] FAILED to send email to ${order.guestEmail}`);
          console.error(`❌ Error Message:`, emailError?.message || emailError);
          console.error(`❌ Error Code:`, emailError?.code);
          console.error(`❌ Error Response:`, emailError?.response);
          console.error(`❌ Full Error Stack:`, emailError?.stack || emailError);
          console.log(`======================================================\n`);
        });

    } catch (emailError: any) {
      console.error(`❌ [Nodemailer] Setup Error:`, emailError?.message || emailError);
      console.log(`======================================================\n`);
    }
  }
}