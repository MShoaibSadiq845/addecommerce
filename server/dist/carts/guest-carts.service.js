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
exports.GuestCartsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const guest_cart_schema_1 = require("./schemas/guest-cart.schema");
let GuestCartsService = class GuestCartsService {
    constructor(guestCartModel) {
        this.guestCartModel = guestCartModel;
    }
    async getCart(sessionId) {
        const cart = await this.guestCartModel.findOne({ sessionId }).exec();
        if (!cart) {
            return this.guestCartModel.create({ sessionId, items: [] });
        }
        return cart;
    }
    async addItem(dto) {
        const cart = await this.guestCartModel.findOneAndUpdate({ sessionId: dto.sessionId }, { $setOnInsert: { sessionId: dto.sessionId, items: [] } }, { upsert: true, new: true });
        const existingIndex = cart.items.findIndex((item) => item.product.equals(new mongoose_2.Types.ObjectId(dto.productId)) &&
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
                quantity: dto.quantity,
                size: dto.size || '',
                color: dto.color || '',
                image: dto.image || '',
            });
        }
        await cart.save();
        return cart;
    }
    async removeItem(sessionId, itemId, size, color) {
        const cart = await this.guestCartModel.findOne({ sessionId }).exec();
        if (!cart)
            throw new common_1.NotFoundException('Cart not found');
        cart.items = cart.items.filter((item) => {
            const idMatch = item._id?.toString() === itemId ||
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
    async clearCart(sessionId) {
        const cart = await this.guestCartModel.findOneAndUpdate({ sessionId }, { items: [] }, { new: true, upsert: true });
        return cart;
    }
};
exports.GuestCartsService = GuestCartsService;
exports.GuestCartsService = GuestCartsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(guest_cart_schema_1.GuestCart.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], GuestCartsService);
//# sourceMappingURL=guest-carts.service.js.map