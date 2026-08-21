import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './schemas/order.schema';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    validateCheckout(dto: {
        items: Array<{
            productId: string;
            quantity: number;
            name?: string;
        }>;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyStripeSession(sessionId: string): Promise<{
        success: boolean;
        message: string;
        order: import("./schemas/order.schema").OrderDocument;
    } | {
        order?: undefined;
        success: boolean;
        message: string;
    }>;
    createOrder(dto: CreateOrderDto): Promise<{
        _id: import("mongoose").Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: 'save' | 'validate' | 'remove' | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        isNew: boolean;
        schema: import("mongoose").Schema;
        guestName: string;
        guestEmail: string;
        guestPhone?: string;
        items: import("./schemas/order.schema").OrderItem[];
        totalAmount: number;
        status: OrderStatus;
        paymentMethod: string;
        paymentStatus: string;
        stripeSessionId?: string;
        stripePaymentIntentId?: string;
        shippingAddress: {
            street: string;
            city: string;
            province: string;
            postalCode: string;
            country: string;
        };
        stripeUrl: string;
        __v: number;
    } | (import("mongoose").Document<unknown, {}, import("./schemas/order.schema").OrderDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/order.schema").Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })>;
    getOrdersByEmail(email: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/order.schema").OrderDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/order.schema").Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
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
        bestSellers: (import("mongoose").Document<unknown, {}, import("../products/schemas/product.schema").ProductDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../products/schemas/product.schema").Product & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        recentOrders: (import("mongoose").Document<unknown, {}, import("./schemas/order.schema").OrderDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/order.schema").Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
    getAllOrders(status?: OrderStatus, search?: string, excludeStatus?: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/order.schema").OrderDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/order.schema").Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getOrderById(id: string): Promise<any>;
    updateOrderStatus(id: string, status: OrderStatus): Promise<import("mongoose").Document<unknown, {}, import("./schemas/order.schema").OrderDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/order.schema").Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
