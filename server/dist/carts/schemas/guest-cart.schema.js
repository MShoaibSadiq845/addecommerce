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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuestCartSchema = exports.GuestCart = exports.GuestCartItemSchema = exports.GuestCartItem = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const product_schema_1 = require("../../products/schemas/product.schema");
let GuestCartItem = class GuestCartItem {
};
exports.GuestCartItem = GuestCartItem;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: product_schema_1.Product.name, required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], GuestCartItem.prototype, "product", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], GuestCartItem.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true }),
    __metadata("design:type", Number)
], GuestCartItem.prototype, "price", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true, default: 1 }),
    __metadata("design:type", Number)
], GuestCartItem.prototype, "quantity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: '' }),
    __metadata("design:type", String)
], GuestCartItem.prototype, "size", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: '' }),
    __metadata("design:type", String)
], GuestCartItem.prototype, "color", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: '' }),
    __metadata("design:type", String)
], GuestCartItem.prototype, "image", void 0);
exports.GuestCartItem = GuestCartItem = __decorate([
    (0, mongoose_1.Schema)()
], GuestCartItem);
exports.GuestCartItemSchema = mongoose_1.SchemaFactory.createForClass(GuestCartItem);
let GuestCart = class GuestCart {
};
exports.GuestCart = GuestCart;
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, unique: true, index: true }),
    __metadata("design:type", String)
], GuestCart.prototype, "sessionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.GuestCartItemSchema], default: [] }),
    __metadata("design:type", Array)
], GuestCart.prototype, "items", void 0);
exports.GuestCart = GuestCart = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], GuestCart);
exports.GuestCartSchema = mongoose_1.SchemaFactory.createForClass(GuestCart);
//# sourceMappingURL=guest-cart.schema.js.map