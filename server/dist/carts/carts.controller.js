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
var _a, _b, _c;
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CartsService } from './carts.service';
import { AddCartItemDto } from './dto/cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { GetUser } from '../auth/get-user.decorator';
// Cart endpoints are admin-only for management; storefront uses Redux local state
// We keep these open for optional sync when token is present
let CartsController = class CartsController {
    cartsService;
    constructor(cartsService) {
        this.cartsService = cartsService;
    }
    async getCart(userId) {
        return this.cartsService.getCart(userId);
    }
    async addToCart(userId, dto) {
        return this.cartsService.addItem(userId, dto);
    }
    async updateCartItem(userId, itemId, dto) {
        return this.cartsService.updateItem(userId, itemId, dto);
    }
    async removeCartItem(userId, itemId) {
        return this.cartsService.removeItem(userId, itemId);
    }
    async clearCart(userId) {
        return this.cartsService.clearCart(userId);
    }
};
__decorate([
    Get(),
    UseGuards(AuthGuard('jwt')),
    __param(0, GetUser('_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "getCart", null);
__decorate([
    Post(),
    UseGuards(AuthGuard('jwt')),
    __param(0, GetUser('_id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_b = typeof AddCartItemDto !== "undefined" && AddCartItemDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "addToCart", null);
__decorate([
    Put(':itemId'),
    UseGuards(AuthGuard('jwt')),
    __param(0, GetUser('_id')),
    __param(1, Param('itemId')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, typeof (_c = typeof UpdateCartItemDto !== "undefined" && UpdateCartItemDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "updateCartItem", null);
__decorate([
    Delete(':itemId'),
    UseGuards(AuthGuard('jwt')),
    __param(0, GetUser('_id')),
    __param(1, Param('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "removeCartItem", null);
__decorate([
    Delete(),
    UseGuards(AuthGuard('jwt')),
    __param(0, GetUser('_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "clearCart", null);
CartsController = __decorate([
    Controller('cart'),
    __param(0, Inject(CartsService)),
    __metadata("design:paramtypes", [typeof (_a = typeof CartsService !== "undefined" && CartsService) === "function" ? _a : Object])
], CartsController);
export { CartsController };
//# sourceMappingURL=carts.controller.js.map