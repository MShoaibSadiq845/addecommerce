import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { NotificationsService } from '../notifications/notifications.service';
export declare class OrdersService {
    private orderModel;
    private productModel;
    private readonly notificationsService;
    private stripe;
    private transporter;
    constructor(orderModel: Model<OrderDocument>, productModel: Model<ProductDocument>, notificationsService: NotificationsService);
    create(dto: CreateOrderDto): Promise<{
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
    } | (import("mongoose").Document<unknown, {}, OrderDocument, {}, import("mongoose").DefaultSchemaOptions> & Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })>;
    verifyStripeSession(sessionId: string): Promise<{
        success: boolean;
        message: string;
        order: OrderDocument;
    } | {
        order?: undefined;
        success: boolean;
        message: string;
    }>;
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
    findByGuestEmail(email: string): Promise<(import("mongoose").Document<unknown, {}, OrderDocument, {}, import("mongoose").DefaultSchemaOptions> & Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findAll(status?: OrderStatus): Promise<(import("mongoose").Document<unknown, {}, OrderDocument, {}, import("mongoose").DefaultSchemaOptions> & Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findById(id: string): Promise<import("mongoose").Document<unknown, {}, OrderDocument, {}, import("mongoose").DefaultSchemaOptions> & Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateStatus(id: string, status: OrderStatus): Promise<import("mongoose").Document<unknown, {}, OrderDocument, {}, import("mongoose").DefaultSchemaOptions> & Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
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
        bestSellers: (import("mongoose").Document<unknown, {}, ProductDocument, {}, import("mongoose").DefaultSchemaOptions> & Product & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        recentOrders: (import("mongoose").Document<unknown, {}, OrderDocument, {}, import("mongoose").DefaultSchemaOptions> & Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
    sendOrderConfirmationEmail(order: any): Promise<void>;
}
