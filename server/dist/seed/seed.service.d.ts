import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { UserDocument } from '../users/schemas/user.schema';
import { ProductDocument } from '../products/schemas/product.schema';
import { OrderDocument } from '../orders/schemas/order.schema';
import { NotificationDocument } from '../notifications/schemas/notification.schema';
export declare class SeedService implements OnModuleInit {
    private userModel;
    private productModel;
    private orderModel;
    private notificationModel;
    private readonly logger;
    constructor(userModel: Model<UserDocument>, productModel: Model<ProductDocument>, orderModel: Model<OrderDocument>, notificationModel: Model<NotificationDocument>);
    onModuleInit(): Promise<void>;
    seedAll(): Promise<void>;
    seedUsers(): Promise<void>;
    seedProducts(): Promise<void>;
    seedOrders(): Promise<void>;
    seedNotifications(): Promise<void>;
}
