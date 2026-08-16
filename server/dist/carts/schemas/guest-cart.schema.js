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
import { Product } from '../../products/schemas/product.schema';
let GuestCartItem = class GuestCartItem {
    product;
    name;
    price;
    quantity;
    size;
    color;
    image;
};
__decorate([
    Prop({ type: Types.ObjectId, ref: Product.name, required: true }),
    __metadata("design:type", Types.ObjectId)
], GuestCartItem.prototype, "product", void 0);
__decorate([
    Prop({ type: String, required: true }),
    __metadata("design:type", String)
], GuestCartItem.prototype, "name", void 0);
__decorate([
    Prop({ type: Number, required: true }),
    __metadata("design:type", Number)
], GuestCartItem.prototype, "price", void 0);
__decorate([
    Prop({ type: Number, required: true, default: 1 }),
    __metadata("design:type", Number)
], GuestCartItem.prototype, "quantity", void 0);
__decorate([
    Prop({ type: String, default: '' }),
    __metadata("design:type", String)
], GuestCartItem.prototype, "size", void 0);
__decorate([
    Prop({ type: String, default: '' }),
    __metadata("design:type", String)
], GuestCartItem.prototype, "color", void 0);
__decorate([
    Prop({ type: String, default: '' }),
    __metadata("design:type", String)
], GuestCartItem.prototype, "image", void 0);
GuestCartItem = __decorate([
    Schema()
], GuestCartItem);
export { GuestCartItem };
export const GuestCartItemSchema = SchemaFactory.createForClass(GuestCartItem);
let GuestCart = class GuestCart {
    /** Browser-generated UUID stored in localStorage */
    sessionId;
    items;
};
__decorate([
    Prop({ type: String, required: true, unique: true, index: true }),
    __metadata("design:type", String)
], GuestCart.prototype, "sessionId", void 0);
__decorate([
    Prop({ type: [GuestCartItemSchema], default: [] }),
    __metadata("design:type", Array)
], GuestCart.prototype, "items", void 0);
GuestCart = __decorate([
    Schema({ timestamps: true })
], GuestCart);
export { GuestCart };
export const GuestCartSchema = SchemaFactory.createForClass(GuestCart);
//# sourceMappingURL=guest-cart.schema.js.map