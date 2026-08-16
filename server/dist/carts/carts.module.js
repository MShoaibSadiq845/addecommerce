var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';
import { Cart, CartSchema } from './schemas/cart.schema';
import { GuestCartsController } from './guest-carts.controller';
import { GuestCartsService } from './guest-carts.service';
import { GuestCart, GuestCartSchema } from './schemas/guest-cart.schema';
let CartsModule = class CartsModule {
};
CartsModule = __decorate([
    Module({
        imports: [
            MongooseModule.forFeature([
                { name: Cart.name, schema: CartSchema },
                { name: GuestCart.name, schema: GuestCartSchema },
            ]),
        ],
        controllers: [CartsController, GuestCartsController],
        providers: [CartsService, GuestCartsService],
        exports: [CartsService, GuestCartsService],
    })
], CartsModule);
export { CartsModule };
//# sourceMappingURL=carts.module.js.map