"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const cart_schema_1 = require("./schemas/cart.schema");
let CartsService = class CartsService {
    constructor(cartModel) {
        this.cartModel = cartModel;
    }
    async getCart(userId) {
        const cart = await this.cartModel.findOne({ user: userId }).exec();
        return cart || { items: [] };
    }
    async addItem(userId, dto) {
        const cart = await this.cartModel.findOneAndUpdate({ user: userId }, { $setOnInsert: { user: new mongoose_2.Types.ObjectId(userId) } }, { upsert: true, new: true });
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
                product: new mongoose_2.Types.ObjectId(dto.productId),
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
            throw new common_1.NotFoundException('Cart not found');
        const item = cart.items.find((i) => i._id?.toString() === itemId || i.id === itemId);
        if (!item)
            throw new common_1.NotFoundException('Cart item not found');
        if (dto.quantity !== undefined)
            item.quantity = Math.max(1, dto.quantity);
        if (dto.size !== undefined)
            item.size = dto.size;
        if (dto.color !== undefined)
            item.color = dto.color;
        await cart.save();
        return cart;
    }
    async removeItem(userId, itemId, size, color) {
        const cart = await this.cartModel.findOne({ user: userId }).exec();
        if (!cart)
            throw new common_1.NotFoundException('Cart not found');
        cart.items = cart.items.filter((item) => {
            const idMatch = item._id?.toString() === itemId ||
                item.id?.toString() === itemId ||
                item.product?.toString() === itemId;
            if (!idMatch)
                return true;
            if (size !== undefined && item.size !== size)
                return true;
            if (color !== undefined && item.color !== color)
                return true;
            return false;
        });
        await cart.save();
        return cart;
    }
    async clearCart(userId) {
        const cart = await this.cartModel.findOneAndUpdate({ user: userId }, { items: [] }, { new: true, upsert: true }).exec();
        return cart;
    }
};
exports.CartsService = CartsService;
exports.CartsService = CartsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(cart_schema_1.Cart.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], CartsService);
//# sourceMappingURL=carts.service.js.map