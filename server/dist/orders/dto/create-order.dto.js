var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsArray, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested, } from 'class-validator';
import { Type } from 'class-transformer';
export class OrderItemDto {
    productId;
    name;
    price;
    quantity;
    color;
    size;
    image;
}
__decorate([
    IsNotEmpty(),
    IsString(),
    __metadata("design:type", String)
], OrderItemDto.prototype, "productId", void 0);
__decorate([
    IsNotEmpty(),
    IsString(),
    __metadata("design:type", String)
], OrderItemDto.prototype, "name", void 0);
__decorate([
    IsNotEmpty(),
    IsNumber(),
    Min(0),
    __metadata("design:type", Number)
], OrderItemDto.prototype, "price", void 0);
__decorate([
    IsNotEmpty(),
    IsNumber(),
    Min(1),
    __metadata("design:type", Number)
], OrderItemDto.prototype, "quantity", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], OrderItemDto.prototype, "color", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], OrderItemDto.prototype, "size", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], OrderItemDto.prototype, "image", void 0);
export class ShippingAddressDto {
    street;
    city;
    province;
    postalCode;
    country;
}
__decorate([
    IsNotEmpty(),
    IsString(),
    __metadata("design:type", String)
], ShippingAddressDto.prototype, "street", void 0);
__decorate([
    IsNotEmpty(),
    IsString(),
    __metadata("design:type", String)
], ShippingAddressDto.prototype, "city", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], ShippingAddressDto.prototype, "province", void 0);
__decorate([
    IsNotEmpty(),
    IsString(),
    __metadata("design:type", String)
], ShippingAddressDto.prototype, "postalCode", void 0);
__decorate([
    IsNotEmpty(),
    IsString(),
    __metadata("design:type", String)
], ShippingAddressDto.prototype, "country", void 0);
export class CreateOrderDto {
    guestName;
    guestEmail;
    items;
    shippingAddress;
}
__decorate([
    IsNotEmpty(),
    IsString(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "guestName", void 0);
__decorate([
    IsNotEmpty(),
    IsEmail(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "guestEmail", void 0);
__decorate([
    IsArray(),
    ValidateNested({ each: true }),
    Type(() => OrderItemDto),
    __metadata("design:type", Array)
], CreateOrderDto.prototype, "items", void 0);
__decorate([
    ValidateNested(),
    Type(() => ShippingAddressDto),
    __metadata("design:type", ShippingAddressDto)
], CreateOrderDto.prototype, "shippingAddress", void 0);
//# sourceMappingURL=create-order.dto.js.map