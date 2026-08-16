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
import { Cart } from './schemas/cart.schema';
let CartsService = class CartsService {
    cartModel;
    constructor(cartModel) {
        this.cartModel = cartModel;
    }
    async getCart(userId) {
        const cart = await this.cartModel.findOne({ user: userId }).exec();
        return cart || { items: [] };
    }
    async addItem(userId, dto) {
        const cart = await this.cartModel.findOneAndUpdate({ user: userId }, { $setOnInsert: { user: new Types.ObjectId(userId) } }, { upsert: true, new: true });
        const paymentMethod = dto.paymentMethod || 'currency';
        const existingIndex = cart.items.findIndex((item) => item.product.equals(dto.productId) &&
            item.paymentMethod === paymentMethod &&
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
                pointsPrice: dto.pointsPrice || 0,
                quantity: dto.quantity,
                paymentMethod,
                size: dto.size || '',
                color: dto.color || '',
                image: dto.image || '',
            });
        }
        await cart.save();
        return cart;
    }
    async updateItem(userId, itemId, dto) {
        const cart = await this.cartModel.findOne({ user: userId }).exec();
        if (!cart)
            throw new NotFoundException('Cart not found');
        const item = cart.items.id(itemId);
        if (!item)
            throw new NotFoundException('Cart item not found');
        if (dto.quantity !== undefined)
            item.quantity = Math.max(1, dto.quantity);
        if (dto.size !== undefined)
            item.size = dto.size;
        if (dto.color !== undefined)
            item.color = dto.color;
        await cart.save();
        return cart;
    }
    async removeItem(userId, itemId) {
        const cart = await this.cartModel.findOne({ user: userId }).exec();
        if (!cart)
            throw new NotFoundException('Cart not found');
        cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
        await cart.save();
        return cart;
    }
    async clearCart(userId) {
        const cart = await this.cartModel.findOneAndUpdate({ user: userId }, { items: [] }, { new: true, upsert: true }).exec();
        return cart;
    }
};
CartsService = __decorate([
    Injectable(),
    __param(0, InjectModel(Cart.name)),
    __metadata("design:paramtypes", [Model])
], CartsService);
export { CartsService };
//# sourceMappingURL=carts.service.js.map