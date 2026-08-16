import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Product } from '../../products/schemas/product.schema';

export type GuestCartDocument = GuestCart & Document;

@Schema()
export class GuestCartItem {
  @Prop({ type: Types.ObjectId, ref: Product.name, required: true })
  product: Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Number, required: true, default: 1 })
  quantity: number;

  @Prop({ type: String, default: '' })
  size: string;

  @Prop({ type: String, default: '' })
  color: string;

  @Prop({ type: String, default: '' })
  image: string;
}

export const GuestCartItemSchema = SchemaFactory.createForClass(GuestCartItem);

@Schema({ timestamps: true })
export class GuestCart {
  /** Browser-generated UUID stored in localStorage */
  @Prop({ type: String, required: true, unique: true, index: true })
  sessionId: string;

  @Prop({ type: [GuestCartItemSchema], default: [] })
  items: GuestCartItem[];
}

export const GuestCartSchema = SchemaFactory.createForClass(GuestCart);
