import { Document, Schema as MongooseSchema } from 'mongoose';
import { Product } from '../../products/schemas/product.schema';
export type OrderDocument = Order & Document;
export declare enum OrderStatus {
    PENDING = "Pending",
    PROCESSING = "Processing",
    SHIPPED = "Shipped",
    DELIVERED = "Delivered",
    CANCELED = "Canceled"
}
export declare enum PaymentMethod {
    COD = "COD",
    STRIPE = "Stripe"
}
export declare enum PaymentStatus {
    UNPAID = "Unpaid",
    PAID = "Paid",
    FAILED = "Failed",
    PENDING = "Pending"
}
export declare class OrderItem {
    product: Product;
    name: string;
    price: number;
    quantity: number;
    color?: string;
    size?: string;
    image?: string;
}
export declare class Order {
    guestName: string;
    guestEmail: string;
    guestPhone?: string;
    items: OrderItem[];
    totalAmount: number;
    status: OrderStatus;
    paymentMethod: string;
    paymentStatus: string;
    stripeSessionId?: string;
    stripePaymentIntentId?: string;
    deliveredAt?: Date;
    canceledAt?: Date;
    shippingAddress: {
        street: string;
        city: string;
        province: string;
        postalCode: string;
        country: string;
    };
}
export declare const OrderSchema: MongooseSchema<Order, import("mongoose").Model<Order, any, any, any, any, any, Order>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Order, Document<unknown, {}, Order, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    guestName?: import("mongoose").SchemaDefinitionProperty<string, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    guestEmail?: import("mongoose").SchemaDefinitionProperty<string, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    guestPhone?: import("mongoose").SchemaDefinitionProperty<string, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    items?: import("mongoose").SchemaDefinitionProperty<OrderItem[], Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    totalAmount?: import("mongoose").SchemaDefinitionProperty<number, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    status?: import("mongoose").SchemaDefinitionProperty<OrderStatus, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    paymentMethod?: import("mongoose").SchemaDefinitionProperty<string, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    paymentStatus?: import("mongoose").SchemaDefinitionProperty<string, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    stripeSessionId?: import("mongoose").SchemaDefinitionProperty<string, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    stripePaymentIntentId?: import("mongoose").SchemaDefinitionProperty<string, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    deliveredAt?: import("mongoose").SchemaDefinitionProperty<Date, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    canceledAt?: import("mongoose").SchemaDefinitionProperty<Date, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    shippingAddress?: import("mongoose").SchemaDefinitionProperty<{
        street: string;
        city: string;
        province: string;
        postalCode: string;
        country: string;
    }, Order, Document<unknown, {}, Order, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, Order>;
