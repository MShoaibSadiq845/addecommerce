var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SeedModule } from './seed/seed.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CartsModule } from './carts/carts.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
let AppModule = class AppModule {
};
AppModule = __decorate([
    Module({
        imports: [
            ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
            MongooseModule.forRootAsync({
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: (config) => ({
                    uri: config.get('MONGODB_URI') ||
                        'mongodb://127.0.0.1:27017/ecommerwebsocket',
                }),
            }),
            // Auth & Users must come before any module that imports AuthModule
            AuthModule,
            UsersModule,
            ProductsModule,
            OrdersModule,
            NotificationsModule,
            SeedModule,
            CloudinaryModule,
            CartsModule,
        ],
    })
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map