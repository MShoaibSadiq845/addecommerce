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
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GuestCart, } from './schemas/guest-cart.schema';
let GuestCartsService = class GuestCartsService {
    guestCartModel;
    constructor(guestCartModel) {
        this.guestCartModel = guestCartModel;
    }
    /** Return the full cart for a session (creates empty cart if none exists) */
    async getCart(sessionId) {
        const cart = await this.guestCartModel.findOne({ sessionId }).exec();
        if (!cart) {
            return this.guestCartModel.create({ sessionId, items: [] });
        }
        return cart;
    }
    /** Add or increment an item */
    async addItem(dto) {
        const cart = await this.guestCartModel.findOneAndUpdate({ sessionId: dto.sessionId }, { $setOnInsert: { sessionId: dto.sessionId, items: [] } }, { upsert: true, new: true });
        const existingIndex = cart.items.findIndex((item) => item.product.equals(new Types.ObjectId(dto.productId)) &&
            item.size === (dto.size || '') &&
            item.color === (dto.color || ''));
        if (existingIndex >= 0) {
            cart.items[existingIndex].quantity += dto.quantity;
        }
        else {
            cart.items.push({
                product: new Types.ObjectId(dto.productId),
                name: dto.name,
                price: dto.price,
                quantity: dto.quantity,
                size: dto.size || '',
                color: dto.color || '',
                image: dto.image || '',
            });
        }
        await cart.save();
        return cart;
    }
    /** Remove one item by its Mongo sub-document id */
    async removeItem(sessionId, itemId) {
        const cart = await this.guestCartModel.findOne({ sessionId }).exec();
        if (!cart)
            throw new NotFoundException('Cart not found');
        cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
        await cart.save();
        return cart;
    }
    /** Clear all items for this session */
    async clearCart(sessionId) {
        const cart = await this.guestCartModel.findOneAndUpdate({ sessionId }, { items: [] }, { new: true, upsert: true });
        return cart;
    }
};
GuestCartsService = __decorate([
    Injectable(),
    __param(0, InjectModel(GuestCart.name)),
    __metadata("design:paramtypes", [Model])
], GuestCartsService);
export { GuestCartsService };
//# sourceMappingURL=guest-carts.service.js.map