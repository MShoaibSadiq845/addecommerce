import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  GuestCart,
  GuestCartDocument,
} from './schemas/guest-cart.schema';
import { GuestAddCartItemDto } from './dto/guest-cart.dto';

@Injectable()
export class GuestCartsService {
  constructor(
    @InjectModel(GuestCart.name)
    private guestCartModel: Model<GuestCartDocument>,
  ) {}

  /** Return the full cart for a session (creates empty cart if none exists) */
  async getCart(sessionId: string): Promise<GuestCartDocument> {
    const cart = await this.guestCartModel.findOne({ sessionId }).exec();
    if (!cart) {
      return this.guestCartModel.create({ sessionId, items: [] });
    }
    return cart;
  }

  /** Add or increment an item */
  async addItem(dto: GuestAddCartItemDto): Promise<GuestCartDocument> {
    const cart = await this.guestCartModel.findOneAndUpdate(
      { sessionId: dto.sessionId },
      { $setOnInsert: { sessionId: dto.sessionId, items: [] } },
      { upsert: true, new: true },
    );

    const existingIndex = cart.items.findIndex(
      (item) =>
        item.product.equals(new Types.ObjectId(dto.productId)) &&
        item.size === (dto.size || '') &&
        item.color === (dto.color || ''),
    );

    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += dto.quantity;
    } else {
      cart.items.push({
        product: new Types.ObjectId(dto.productId),
        name: dto.name,
        price: dto.price,
        quantity: dto.quantity,
        size: dto.size || '',
        color: dto.color || '',
        image: dto.image || '',
      } as any);
    }

    await cart.save();
    return cart;
  }

  /** Remove one item by its Mongo sub-document id */
  async removeItem(
    sessionId: string,
    itemId: string,
  ): Promise<GuestCartDocument> {
    const cart = await this.guestCartModel.findOne({ sessionId }).exec();
    if (!cart) throw new NotFoundException('Cart not found');

    cart.items = cart.items.filter(
      (item) => (item as any)._id.toString() !== itemId,
    );
    await cart.save();
    return cart;
  }

  /** Clear all items for this session */
  async clearCart(sessionId: string): Promise<GuestCartDocument> {
    const cart = await this.guestCartModel.findOneAndUpdate(
      { sessionId },
      { items: [] },
      { new: true, upsert: true },
    );
    return cart;
  }
}
