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
exports.CartSchema = exports.Cart = exports.CartItemSchema = exports.CartItem = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../../users/schemas/user.schema");
const product_schema_1 = require("../../products/schemas/product.schema");
let CartItem = class CartItem {
};
exports.CartItem = CartItem;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: product_schema_1.Product.name, required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], CartItem.prototype, "product", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], CartItem.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true }),
    __metadata("design:type", Number)
], CartItem.prototype, "price", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], CartItem.prototype, "pointsPrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true, default: 1 }),
    __metadata("design:type", Number)
], CartItem.prototype, "quantity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['currency', 'points'], default: 'currency' }),
    __metadata("design:type", String)
], CartItem.prototype, "paymentMethod", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: '' }),
    __metadata("design:type", String)
], CartItem.prototype, "size", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: '' }),
    __metadata("design:type", String)
], CartItem.prototype, "color", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: '' }),
    __metadata("design:type", String)
], CartItem.prototype, "image", void 0);
exports.CartItem = CartItem = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], CartItem);
exports.CartItemSchema = mongoose_1.SchemaFactory.createForClass(CartItem);
let Cart = class Cart {
};
exports.Cart = Cart;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: user_schema_1.User.name, required: true, unique: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Cart.prototype, "user", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.CartItemSchema], default: [] }),
    __metadata("design:type", Array)
], Cart.prototype, "items", void 0);
exports.Cart = Cart = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Cart);
exports.CartSchema = mongoose_1.SchemaFactory.createForClass(Cart);
//# sourceMappingURL=cart.schema.js.map