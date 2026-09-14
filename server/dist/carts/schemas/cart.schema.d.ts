import { Document, Types } from 'mongoose';
export type CartDocument = Cart & Document;
export declare class CartItem {
    product: Types.ObjectId;
    name: string;
    price: number;
    pointsPrice: number;
    quantity: number;
    paymentMethod: 'currency' | 'points';
    size: string;
    color: string;
    image: string;
}
export declare const CartItemSchema: import("mongoose").Schema<CartItem, import("mongoose").Model<CartItem, any, any, any, any, any, CartItem>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, CartItem, Document<unknown, {}, CartItem, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<CartItem & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    product?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, CartItem, Document<unknown, {}, CartItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CartItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    name?: import("mongoose").SchemaDefinitionProperty<string, CartItem, Document<unknown, {}, CartItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CartItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    price?: import("mongoose").SchemaDefinitionProperty<number, CartItem, Document<unknown, {}, CartItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CartItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    pointsPrice?: import("mongoose").SchemaDefinitionProperty<number, CartItem, Document<unknown, {}, CartItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CartItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    quantity?: import("mongoose").SchemaDefinitionProperty<number, CartItem, Document<unknown, {}, CartItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CartItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    paymentMethod?: import("mongoose").SchemaDefinitionProperty<"currency" | "points", CartItem, Document<unknown, {}, CartItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CartItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    size?: import("mongoose").SchemaDefinitionProperty<string, CartItem, Document<unknown, {}, CartItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CartItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    color?: import("mongoose").SchemaDefinitionProperty<string, CartItem, Document<unknown, {}, CartItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CartItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    image?: import("mongoose").SchemaDefinitionProperty<string, CartItem, Document<unknown, {}, CartItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CartItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, CartItem>;
export declare class Cart {
    user: Types.ObjectId;
    items: CartItem[];
}
export declare const CartSchema: import("mongoose").Schema<Cart, import("mongoose").Model<Cart, any, any, any, any, any, Cart>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Cart, Document<unknown, {}, Cart, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Cart & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    user?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Cart, Document<unknown, {}, Cart, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Cart & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    items?: import("mongoose").SchemaDefinitionProperty<CartItem[], Cart, Document<unknown, {}, Cart, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Cart & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, Cart>;
