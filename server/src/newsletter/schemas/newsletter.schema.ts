import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NewsletterDocument = Newsletter & Document;

@Schema({ timestamps: true })
export class Newsletter {
  @Prop({ type: String, required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ type: String, required: false, trim: true, default: '' })
  phone?: string;
}

export const NewsletterSchema = SchemaFactory.createForClass(Newsletter);

