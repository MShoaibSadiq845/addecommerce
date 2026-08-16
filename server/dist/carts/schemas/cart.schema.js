var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Product } from '../../products/schemas/product.schema';
let CartItem = class CartItem {
    product;
    name;
    price;
    pointsPrice;
    quantity;
    paymentMethod;
    size;
    color;
    image;
};
__decorate([
    Prop({ type: Types.ObjectId, ref: Product.name, required: true }),
    __metadata("design:type", Types.ObjectId)
], CartItem.prototype, "product", void 0);
__decorate([
    Prop({ type: String, required: true }),
    __metadata("design:type", String)
], CartItem.prototype, "name", void 0);
__decorate([
    Prop({ type: Number, required: true }),
    __metadata("design:type", Number)
], CartItem.prototype, "price", void 0);
__decorate([
    Prop({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], CartItem.prototype, "pointsPrice", void 0);
__decorate([
    Prop({ type: Number, required: true, default: 1 }),
    __metadata("design:type", Number)
], CartItem.prototype, "quantity", void 0);
__decorate([
    Prop({ type: String, enum: ['currency', 'points'], default: 'currency' }),
    __metadata("design:type", String)
], CartItem.prototype, "paymentMethod", void 0);
__decorate([
    Prop({ type: String, default: '' }),
    __metadata("design:type", String)
], CartItem.prototype, "size", void 0);
__decorate([
    Prop({ type: String, default: '' }),
    __metadata("design:type", String)
], CartItem.prototype, "color", void 0);
__decorate([
    Prop({ type: String, default: '' }),
    __metadata("design:type", String)
], CartItem.prototype, "image", void 0);
CartItem = __decorate([
    Schema({ timestamps: true })
], CartItem);
export { CartItem };
export const CartItemSchema = SchemaFactory.createForClass(CartItem);
let Cart = class Cart {
    user;
    items;
};
__decorate([
    Prop({ type: Types.ObjectId, ref: User.name, required: true, unique: true }),
    __metadata("design:type", Types.ObjectId)
], Cart.prototype, "user", void 0);
__decorate([
    Prop({ type: [CartItemSchema], default: [] }),
    __metadata("design:type", Array)
], Cart.prototype, "items", void 0);
Cart = __decorate([
    Schema({ timestamps: true })
], Cart);
export { Cart };
export const CartSchema = SchemaFactory.createForClass(Cart);
//# sourceMappingURL=cart.schema.js.map