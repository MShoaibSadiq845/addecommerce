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
var _a, _b;
import { Controller, Get, Post, Delete, Body, Param, Query, BadRequestException, Inject, } from '@nestjs/common';
import { GuestCartsService } from './guest-carts.service';
import { GuestAddCartItemDto } from './dto/guest-cart.dto';
/** Public cart endpoints — no authentication required.
 *  The client generates a UUID (sessionId) stored in localStorage
 *  and passes it with every request. */
let GuestCartsController = class GuestCartsController {
    guestCartsService;
    constructor(guestCartsService) {
        this.guestCartsService = guestCartsService;
    }
    /** GET /guest-cart?sessionId=<uuid> */
    async getCart(sessionId) {
        if (!sessionId)
            throw new BadRequestException('sessionId is required');
        return this.guestCartsService.getCart(sessionId);
    }
    /** POST /guest-cart  — body includes sessionId + item fields */
    async addItem(dto) {
        return this.guestCartsService.addItem(dto);
    }
    /** DELETE /guest-cart/:itemId?sessionId=<uuid> */
    async removeItem(itemId, sessionId) {
        if (!sessionId)
            throw new BadRequestException('sessionId is required');
        return this.guestCartsService.removeItem(sessionId, itemId);
    }
    /** DELETE /guest-cart?sessionId=<uuid>  — clears whole cart */
    async clearCart(sessionId) {
        if (!sessionId)
            throw new BadRequestException('sessionId is required');
        return this.guestCartsService.clearCart(sessionId);
    }
};
__decorate([
    Get(),
    __param(0, Query('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GuestCartsController.prototype, "getCart", null);
__decorate([
    Post(),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof GuestAddCartItemDto !== "undefined" && GuestAddCartItemDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], GuestCartsController.prototype, "addItem", null);
__decorate([
    Delete(':itemId'),
    __param(0, Param('itemId')),
    __param(1, Query('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GuestCartsController.prototype, "removeItem", null);
__decorate([
    Delete(),
    __param(0, Query('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GuestCartsController.prototype, "clearCart", null);
GuestCartsController = __decorate([
    Controller('guest-cart'),
    __param(0, Inject(GuestCartsService)),
    __metadata("design:paramtypes", [typeof (_a = typeof GuestCartsService !== "undefined" && GuestCartsService) === "function" ? _a : Object])
], GuestCartsController);
export { GuestCartsController };
//# sourceMappingURL=guest-carts.controller.js.map