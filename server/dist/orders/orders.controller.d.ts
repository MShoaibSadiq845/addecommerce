import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './schemas/order.schema';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    createOrder(dto: CreateOrderDto): Promise<any>;
    getOrdersByEmail(email: string): Promise<any>;
    getAdminMetrics(): Promise<any>;
    getAllOrders(status?: OrderStatus): Promise<any>;
    getOrderById(id: string): Promise<any>;
    updateOrderStatus(id: string, status: OrderStatus): Promise<any>;
}
