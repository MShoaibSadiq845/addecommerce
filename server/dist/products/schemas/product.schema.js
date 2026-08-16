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
let Product = class Product {
    name;
    description;
    price;
    salePrice;
    isOnSale;
    category;
    brand;
    colors;
    sizes;
    stock;
    sku;
    images;
    tags;
    rating;
    numReviews;
    totalSales;
};
__decorate([
    Prop({ type: String, required: true }),
    __metadata("design:type", String)
], Product.prototype, "name", void 0);
__decorate([
    Prop({ type: String, required: true }),
    __metadata("design:type", String)
], Product.prototype, "description", void 0);
__decorate([
    Prop({ type: Number, required: true, min: 0 }),
    __metadata("design:type", Number)
], Product.prototype, "price", void 0);
__decorate([
    Prop({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Product.prototype, "salePrice", void 0);
__decorate([
    Prop({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Product.prototype, "isOnSale", void 0);
__decorate([
    Prop({ type: String, required: true }),
    __metadata("design:type", String)
], Product.prototype, "category", void 0);
__decorate([
    Prop({ type: String, default: 'SHOP.CO' }),
    __metadata("design:type", String)
], Product.prototype, "brand", void 0);
__decorate([
    Prop({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Product.prototype, "colors", void 0);
__decorate([
    Prop({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Product.prototype, "sizes", void 0);
__decorate([
    Prop({ type: Number, required: true, default: 0 }),
    __metadata("design:type", Number)
], Product.prototype, "stock", void 0);
__decorate([
    Prop({ type: String, required: true, unique: true }),
    __metadata("design:type", String)
], Product.prototype, "sku", void 0);
__decorate([
    Prop({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Product.prototype, "images", void 0);
__decorate([
    Prop({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Product.prototype, "tags", void 0);
__decorate([
    Prop({ type: Number, default: 4.5 }),
    __metadata("design:type", Number)
], Product.prototype, "rating", void 0);
__decorate([
    Prop({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Product.prototype, "numReviews", void 0);
__decorate([
    Prop({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Product.prototype, "totalSales", void 0);
Product = __decorate([
    Schema({ timestamps: true })
], Product);
export { Product };
export const ProductSchema = SchemaFactory.createForClass(Product);
//# sourceMappingURL=product.schema.js.map