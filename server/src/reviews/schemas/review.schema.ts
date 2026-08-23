import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  comment: string;

  @Prop({ type: Number, required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ type: String, required: false })
  productId?: string;

  @Prop({ type: String, required: false })
  productName?: string;

  @Prop({ type: String, required: false })
  image?: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
