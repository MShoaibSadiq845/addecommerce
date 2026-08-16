import { Model } from 'mongoose';
import { OrderDocument, OrderStatus } from './schemas/order.schema';
import { ProductDocument } from '../products/schemas/product.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { NotificationsService } from '../notifications/notifications.service';
export declare class OrdersService {
    private orderModel;
    private productModel;
    private readonly notificationsService;
    constructor(orderModel: Model<OrderDocument>, productModel: Model<ProductDocument>, notificationsService: NotificationsService);
    create(dto: CreateOrderDto): Promise<any>;
    validateCoupon(code: string): Promise<void>;
    findByGuestEmail(email: string): Promise<any[]>;
    findAll(status?: OrderStatus): Promise<any[]>;
    findById(id: string): Promise<any>;
    updateStatus(id: string, status: OrderStatus): Promise<any>;
    getAdminMetrics(): Promise<{
        totalOrders: number;
        activeOrders: number;
        completedOrders: number;
        canceledOrders: number;
        totalRevenue: any;
        salesGraphData: {
            year: any;
            month: string;
            monthNum: any;
            sales: any;
        }[];
        bestSellers: any[];
        recentOrders: any[];
    }>;
}
