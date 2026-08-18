import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Product } from '../../products/schemas/product.schema';

export type OrderDocument = Order & Document;

export enum OrderStatus {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  CANCELED = 'Canceled',
}

export enum PaymentMethod {
  COD = 'COD',
  STRIPE = 'Stripe',
}

export enum PaymentStatus {
  UNPAID = 'Unpaid',
  PAID = 'Paid',
  FAILED = 'Failed',
  PENDING = 'Pending',
}

@Schema()
export class OrderItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  product: Product;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Number, required: true })
  quantity: number;

  @Prop({ type: String })
  color?: string;

  @Prop({ type: String })
  size?: string;

  @Prop({ type: String })
  image?: string;
}

const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order {
  // Guest customer info — no auth required
  @Prop({ type: String, required: true })
  guestName: string;

  @Prop({ type: String, required: true, lowercase: true, trim: true })
  guestEmail: string;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({ type: Number, required: true, default: 0 })
  totalAmount: number;

  @Prop({ type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING })
  status: OrderStatus;

  @Prop({ type: String, default: 'COD' })
  paymentMethod: string;

  @Prop({ type: String, default: 'Unpaid' })
  paymentStatus: string;

  @Prop({ type: String })
  stripeSessionId?: string;

  @Prop({ type: String })
  stripePaymentIntentId?: string;

  @Prop({
    type: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      province: { type: String, default: '' },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    required: true,
  })
  shippingAddress: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
}

export const OrderSchema = SchemaFactory.createForClass(Order);
