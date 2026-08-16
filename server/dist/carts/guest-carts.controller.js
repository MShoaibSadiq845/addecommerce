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
exports.GuestCartsController = void 0;
const common_1 = require("@nestjs/common");
const guest_carts_service_1 = require("./guest-carts.service");
const guest_cart_dto_1 = require("./dto/guest-cart.dto");
let GuestCartsController = class GuestCartsController {
    constructor(guestCartsService) {
        this.guestCartsService = guestCartsService;
    }
    async getCart(sessionId) {
        if (!sessionId)
            throw new common_1.BadRequestException('sessionId is required');
        return this.guestCartsService.getCart(sessionId);
    }
    async addItem(dto) {
        return this.guestCartsService.addItem(dto);
    }
    async removeItem(itemId, sessionId, size, color) {
        if (!sessionId)
            throw new common_1.BadRequestException('sessionId is required');
        const cart = await this.guestCartsService.removeItem(sessionId, itemId, size, color);
        return {
            success: true,
            message: 'Item removed from cart',
            cart,
        };
    }
    async clearCart(sessionId) {
        if (!sessionId)
            throw new common_1.BadRequestException('sessionId is required');
        return this.guestCartsService.clearCart(sessionId);
    }
};
exports.GuestCartsController = GuestCartsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GuestCartsController.prototype, "getCart", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [guest_cart_dto_1.GuestAddCartItemDto]),
    __metadata("design:returntype", Promise)
], GuestCartsController.prototype, "addItem", null);
__decorate([
    (0, common_1.Delete)(':itemId'),
    __param(0, (0, common_1.Param)('itemId')),
    __param(1, (0, common_1.Query)('sessionId')),
    __param(2, (0, common_1.Query)('size')),
    __param(3, (0, common_1.Query)('color')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], GuestCartsController.prototype, "removeItem", null);
__decorate([
    (0, common_1.Delete)(),
    __param(0, (0, common_1.Query)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GuestCartsController.prototype, "clearCart", null);
exports.GuestCartsController = GuestCartsController = __decorate([
    (0, common_1.Controller)('guest-cart'),
    __param(0, (0, common_1.Inject)(guest_carts_service_1.GuestCartsService)),
    __metadata("design:paramtypes", [guest_carts_service_1.GuestCartsService])
], GuestCartsController);
//# sourceMappingURL=guest-carts.controller.js.map