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
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resend_1 = require("resend");
let MailService = MailService_1 = class MailService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(MailService_1.name);
        const apiKey = this.configService?.get('RESEND_API_KEY') || process.env.RESEND_API_KEY;
        if (!apiKey) {
            this.logger.warn('RESEND_API_KEY is not defined in environment variables.');
        }
        this.resend = new resend_1.Resend(apiKey);
    }
    async sendOrderConfirmationEmail(userEmail, orderDetails) {
        if (!userEmail) {
            throw new common_1.InternalServerErrorException('Recipient email address is required');
        }
        const orderIdStr = orderDetails._id ? orderDetails._id.toString() : '';
        const orderShortId = orderIdStr ? orderIdStr.slice(-6).toUpperCase() : 'N/A';
        const guestName = orderDetails.guestName || 'Valued Customer';
        const paymentMethod = orderDetails.paymentMethod || 'COD';
        const paymentStatus = orderDetails.paymentStatus || 'Unpaid';
        const totalAmount = Number(orderDetails.totalAmount || 0).toLocaleString();
        let addressStr = 'N/A';
        if (orderDetails.shippingAddress) {
            const { street, city, province, postalCode, country } = orderDetails.shippingAddress;
            addressStr = [street, city, province, postalCode, country].filter(Boolean).join(', ');
        }
        const items = orderDetails.items || [];
        const itemsHtml = items
            .map((item) => {
            const itemPrice = Number(item.price || 0);
            const itemQty = Number(item.quantity || 1);
            const itemTotal = (itemPrice * itemQty).toLocaleString();
            const details = [item.color ? `Color: ${item.color}` : '', item.size ? `Size: ${item.size}` : '']
                .filter(Boolean)
                .join(' | ');
            return `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 14px 12px; font-size: 14px; color: #1f2937;">
              <strong style="color: #111827; font-size: 15px;">${item.name || 'Product'}</strong>
              ${details ? `<div style="font-size: 12px; color: #6b7280; margin-top: 3px;">${details}</div>` : ''}
            </td>
            <td style="padding: 14px 12px; font-size: 14px; color: #374151; text-align: center; font-weight: 500;">
              ${itemQty}
            </td>
            <td style="padding: 14px 12px; font-size: 14px; color: #374151; text-align: right;">
              Rs ${itemPrice.toLocaleString()}
            </td>
            <td style="padding: 14px 12px; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">
              Rs ${itemTotal}
            </td>
          </tr>
        `;
        })
            .join('');
        const itemsText = items
            .map((item) => `- ${item.name}${item.color || item.size ? ` (${[item.color, item.size].filter(Boolean).join(', ')})` : ''} x ${item.quantity} = Rs ${(Number(item.price) * Number(item.quantity)).toLocaleString()}`)
            .join('\n');
        const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - Fab Decor Co</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f5f7; padding: 40px 15px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.01);">
                
                <!-- Branding Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 36px 28px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; letter-spacing: 4px; font-weight: 800; text-transform: uppercase;">FAB DECOR CO</h1>
                    <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase;">Luxury Furniture & Modern Living</p>
                  </td>
                </tr>

                <!-- Content Area -->
                <tr>
                  <td style="padding: 36px 32px;">
                    <div style="text-align: center; margin-bottom: 28px;">
                      <div style="display: inline-block; background-color: #dcfce7; color: #15803d; border-radius: 50%; width: 56px; height: 56px; line-height: 56px; font-size: 28px; margin-bottom: 12px;">✓</div>
                      <h2 style="margin: 0 0 8px 0; color: #0f172a; font-size: 24px; font-weight: 700;">Order Confirmed!</h2>
                      <p style="margin: 0; color: #64748b; font-size: 15px; line-height: 1.5;">
                        Thank you, <strong style="color: #0f172a;">${guestName}</strong>! We’ve received your order and are getting it ready for shipment.
                      </p>
                    </div>

                    <!-- Order Summary Card -->
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
                      <table width="100%" cellspacing="0" cellpadding="0" style="font-size: 14px;">
                        <tr>
                          <td style="padding: 6px 0; color: #64748b; width: 42%;">Order Number:</td>
                          <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">#${orderShortId}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #64748b;">Payment Method:</td>
                          <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${paymentMethod}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #64748b;">Payment Status:</td>
                          <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${paymentStatus}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #64748b; vertical-align: top;">Shipping Address:</td>
                          <td style="padding: 6px 0; color: #0f172a; font-weight: 500; line-height: 1.4;">${addressStr}</td>
                        </tr>
                      </table>
                    </div>

                    <!-- Items Table -->
                    <h3 style="margin: 0 0 14px 0; color: #0f172a; font-size: 17px; font-weight: 700; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">
                      Items Ordered
                    </h3>
                    <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 24px;">
                      <thead>
                        <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                          <th style="padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase;">Item</th>
                          <th style="padding: 10px 12px; text-align: center; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase;">Qty</th>
                          <th style="padding: 10px 12px; text-align: right; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase;">Price</th>
                          <th style="padding: 10px 12px; text-align: right; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase;">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHtml}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colspan="3" style="padding: 18px 12px 6px 12px; text-align: right; font-size: 16px; font-weight: 700; color: #0f172a;">Grand Total:</td>
                          <td style="padding: 18px 12px 6px 12px; text-align: right; font-size: 20px; font-weight: 800; color: #059669;">Rs ${totalAmount}</td>
                        </tr>
                      </tfoot>
                    </table>

                    <!-- Customer Support Banner -->
                    <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px 18px; border-radius: 6px; margin-top: 24px;">
                      <p style="margin: 0; color: #15803d; font-size: 14px; line-height: 1.5;">
                        <strong>Need help with your order?</strong> If you have any questions, feel free to reply directly to this email or contact support at <a href="mailto:support@fabdecorco.com" style="color: #15803d; font-weight: 600; text-decoration: underline;">support@fabdecorco.com</a>.
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0 0 6px 0; color: #64748b; font-size: 13px;">&copy; ${new Date().getFullYear()} Fab Decor Co. All rights reserved.</p>
                    <p style="margin: 0; color: #94a3b8; font-size: 12px;">This email was sent automatically to confirm your order.</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
        try {
            this.logger.log(`Sending order confirmation email to ${userEmail} via Resend...`);
            const fromAddress = this.configService?.get('RESEND_FROM_EMAIL') || 'Fab Decor Co <support@fabdecorco.com>';
            const { data, error } = await this.resend.emails.send({
                from: fromAddress,
                to: [userEmail],
                subject: `Order Confirmation #${orderShortId} - Fab Decor Co`,
                text: `Thank you ${guestName}!\n\nYour order #${orderShortId} has been confirmed.\nPayment Method: ${paymentMethod}\nShipping Address: ${addressStr}\nTotal: Rs ${totalAmount}\n\nSummary:\n${itemsText}`,
                html: htmlContent,
            });
            if (error) {
                this.logger.error(`Resend API returned error for ${userEmail}: ${JSON.stringify(error)}`);
                throw new common_1.InternalServerErrorException(`Failed to send order confirmation email: ${error.message || JSON.stringify(error)}`);
            }
            this.logger.log(`Successfully sent order confirmation email to ${userEmail}. Email ID: ${data?.id}`);
            return data;
        }
        catch (err) {
            this.logger.error(`Error in sendOrderConfirmationEmail for ${userEmail}:`, err?.stack || err);
            if (err instanceof common_1.InternalServerErrorException) {
                throw err;
            }
            throw new common_1.InternalServerErrorException(err?.message || 'Internal server error while sending order confirmation email via Resend');
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(config_1.ConfigService)),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map