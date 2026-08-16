import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: Number, required: true, min: 0 })
  price: number;

  @Prop({ type: Number, default: 0 })
  salePrice: number;

  @Prop({ type: Boolean, default: false })
  isOnSale: boolean;

  @Prop({ type: String, required: true })
  category: string;

  @Prop({ type: String, default: 'SHOP.CO' })
  brand: string;

  @Prop({ type: [String], default: [] })
  colors: string[];

  @Prop({ type: [String], default: [] })
  sizes: string[];

  @Prop({ type: Number, required: true, default: 0 })
  stock: number;

  @Prop({ type: String, required: true, unique: true })
  sku: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Number, default: 4.5 })
  rating: number;

  @Prop({ type: Number, default: 0 })
  numReviews: number;

  @Prop({ type: Number, default: 0 })
  totalSales: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
