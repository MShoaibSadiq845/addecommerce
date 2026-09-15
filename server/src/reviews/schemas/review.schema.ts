import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: false })
  user_name?: string;

  @Prop({ type: String, required: true })
  comment: string;

  @Prop({ type: Number, required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ type: String, required: false, index: true })
  productId?: string;

  @Prop({ type: String, required: false })
  productName?: string;

  @Prop({ type: String, required: false })
  image?: string;

  @Prop({ type: [String], required: false, default: [] })
  images?: string[];

  @Prop({ type: Date, required: false })
  created_at?: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

ReviewSchema.pre('save', function () {
  if (!this.user_name && this.name) {
    this.user_name = this.name;
  }
  if (!this.name && this.user_name) {
    this.name = this.user_name;
  }
  if (!this.created_at) {
    this.created_at = (this as any).createdAt || new Date();
  }
});
