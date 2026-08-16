var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { Product } from '../../products/schemas/product.schema';
export var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "Pending";
    OrderStatus["PROCESSING"] = "Processing";
    OrderStatus["SHIPPED"] = "Shipped";
    OrderStatus["DELIVERED"] = "Delivered";
    OrderStatus["CANCELED"] = "Canceled";
})(OrderStatus || (OrderStatus = {}));
let OrderItem = class OrderItem {
    product;
    name;
    price;
    quantity;
    color;
    size;
    image;
};
__decorate([
    Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true }),
    __metadata("design:type", typeof (_a = typeof Product !== "undefined" && Product) === "function" ? _a : Object)
], OrderItem.prototype, "product", void 0);
__decorate([
    Prop({ type: String, required: true }),
    __metadata("design:type", String)
], OrderItem.prototype, "name", void 0);
__decorate([
    Prop({ type: Number, required: true }),
    __metadata("design:type", Number)
], OrderItem.prototype, "price", void 0);
__decorate([
    Prop({ type: Number, required: true }),
    __metadata("design:type", Number)
], OrderItem.prototype, "quantity", void 0);
__decorate([
    Prop({ type: String }),
    __metadata("design:type", String)
], OrderItem.prototype, "color", void 0);
__decorate([
    Prop({ type: String }),
    __metadata("design:type", String)
], OrderItem.prototype, "size", void 0);
__decorate([
    Prop({ type: String }),
    __metadata("design:type", String)
], OrderItem.prototype, "image", void 0);
OrderItem = __decorate([
    Schema()
], OrderItem);
export { OrderItem };
const OrderItemSchema = SchemaFactory.createForClass(OrderItem);
let Order = class Order {
    // Guest customer info — no auth required
    guestName;
    guestEmail;
    items;
    totalAmount;
    status;
    shippingAddress;
};
__decorate([
    Prop({ type: String, required: true }),
    __metadata("design:type", String)
], Order.prototype, "guestName", void 0);
__decorate([
    Prop({ type: String, required: true, lowercase: true, trim: true }),
    __metadata("design:type", String)
], Order.prototype, "guestEmail", void 0);
__decorate([
    Prop({ type: [OrderItemSchema], required: true }),
    __metadata("design:type", Array)
], Order.prototype, "items", void 0);
__decorate([
    Prop({ type: Number, required: true, default: 0 }),
    __metadata("design:type", Number)
], Order.prototype, "totalAmount", void 0);
__decorate([
    Prop({ type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING }),
    __metadata("design:type", String)
], Order.prototype, "status", void 0);
__decorate([
    Prop({
        type: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            province: { type: String, default: '' },
            postalCode: { type: String, required: true },
            country: { type: String, required: true },
        },
        required: true,
    }),
    __metadata("design:type", Object)
], Order.prototype, "shippingAddress", void 0);
Order = __decorate([
    Schema({ timestamps: true })
], Order);
export { Order };
export const OrderSchema = SchemaFactory.createForClass(Order);
//# sourceMappingURL=order.schema.js.map