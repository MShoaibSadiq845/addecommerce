import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  USER = 'User',
  ADMIN = 'Admin',
  SUPER_ADMIN = 'Super Admin',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ type: String, required: false, default: '' })
  password?: string;

  @Prop({ type: String, enum: Object.values(UserRole), default: UserRole.USER })
  role: UserRole;

  @Prop({ type: Number, default: 0 })
  loyaltyPoints: number;

  @Prop({ type: String, default: '' })
  avatar: string;

  @Prop({ type: String, default: '' })
  phone: string;

  @Prop({ type: String, default: '' })
  address: string;

  @Prop({ type: String, default: 'local' })
  provider: string;

  @Prop({ type: String, default: '' })
  providerId: string;

  @Prop({ type: Date })
  lastLogin?: Date;

  @Prop({ type: Array, default: [] })
  linkedProviders?: Array<{ provider: string; providerId: string }>;
}

export const UserSchema = SchemaFactory.createForClass(User);
