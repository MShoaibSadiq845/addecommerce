import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';
import { Cart, CartSchema } from './schemas/cart.schema';

import { GuestCartsController } from './guest-carts.controller';
import { GuestCartsService } from './guest-carts.service';
import { GuestCart, GuestCartSchema } from './schemas/guest-cart.schema';

@Module({
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
export class CartsModule {}
