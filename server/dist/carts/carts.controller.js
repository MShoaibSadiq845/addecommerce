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
exports.CartsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const carts_service_1 = require("./carts.service");
const cart_item_dto_1 = require("./dto/cart-item.dto");
const update_cart_item_dto_1 = require("./dto/update-cart-item.dto");
const get_user_decorator_1 = require("../auth/get-user.decorator");
let CartsController = class CartsController {
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
    async removeCartItem(userId, itemId, size, color) {
        const cart = await this.cartsService.removeItem(userId, itemId, size, color);
        return {
            success: true,
            message: 'Item removed from cart',
            cart,
        };
    }
    async clearCart(userId) {
        return this.cartsService.clearCart(userId);
    }
};
exports.CartsController = CartsController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, get_user_decorator_1.GetUser)('_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "getCart", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, get_user_decorator_1.GetUser)('_id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cart_item_dto_1.AddCartItemDto]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "addToCart", null);
__decorate([
    (0, common_1.Put)(':itemId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, get_user_decorator_1.GetUser)('_id')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_cart_item_dto_1.UpdateCartItemDto]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "updateCartItem", null);
__decorate([
    (0, common_1.Delete)(':itemId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, get_user_decorator_1.GetUser)('_id')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, common_1.Query)('size')),
    __param(3, (0, common_1.Query)('color')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "removeCartItem", null);
__decorate([
    (0, common_1.Delete)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, get_user_decorator_1.GetUser)('_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "clearCart", null);
exports.CartsController = CartsController = __decorate([
    (0, common_1.Controller)('cart'),
    __param(0, (0, common_1.Inject)(carts_service_1.CartsService)),
    __metadata("design:paramtypes", [carts_service_1.CartsService])
], CartsController);
//# sourceMappingURL=carts.controller.js.map