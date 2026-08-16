var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product, ProductSchema } from './schemas/product.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
let ProductsModule = class ProductsModule {
};
ProductsModule = __decorate([
    Module({
        imports: [
            MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
            MulterModule.register({
                storage: memoryStorage(),
                limits: {
                    fileSize: 5 * 1024 * 1024, // 5MB
                },
            }),
            NotificationsModule,
            CloudinaryModule,
        ],
        controllers: [ProductsController],
        providers: [ProductsService],
        exports: [ProductsService, MongooseModule],
    })
], ProductsModule);
export { ProductsModule };
//# sourceMappingURL=products.module.js.map