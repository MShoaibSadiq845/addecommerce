var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order, OrderSchema } from './schemas/order.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { NotificationsModule } from '../notifications/notifications.module';
let OrdersModule = class OrdersModule {
};
OrdersModule = __decorate([
    Module({
        imports: [
            MongooseModule.forFeature([
                { name: Order.name, schema: OrderSchema },
                { name: Product.name, schema: ProductSchema },
            ]),
            NotificationsModule,
        ],
        controllers: [OrdersController],
        providers: [OrdersService],
        exports: [OrdersService],
    })
], OrdersModule);
export { OrdersModule };
//# sourceMappingURL=orders.module.js.map