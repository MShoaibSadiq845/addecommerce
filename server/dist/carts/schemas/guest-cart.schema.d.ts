import { Document, Types } from 'mongoose';
export type GuestCartDocument = GuestCart & Document;
export declare class GuestCartItem {
    product: Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    size: string;
    color: string;
    image: string;
}
export declare const GuestCartItemSchema: import("mongoose").Schema<GuestCartItem, import("mongoose").Model<GuestCartItem, any, any, any, any, any, GuestCartItem>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, GuestCartItem, Document<unknown, {}, GuestCartItem, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<GuestCartItem & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    product?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, GuestCartItem, Document<unknown, {}, GuestCartItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<GuestCartItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    name?: import("mongoose").SchemaDefinitionProperty<string, GuestCartItem, Document<unknown, {}, GuestCartItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<GuestCartItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    price?: import("mongoose").SchemaDefinitionProperty<number, GuestCartItem, Document<unknown, {}, GuestCartItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<GuestCartItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    quantity?: import("mongoose").SchemaDefinitionProperty<number, GuestCartItem, Document<unknown, {}, GuestCartItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<GuestCartItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    size?: import("mongoose").SchemaDefinitionProperty<string, GuestCartItem, Document<unknown, {}, GuestCartItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<GuestCartItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    color?: import("mongoose").SchemaDefinitionProperty<string, GuestCartItem, Document<unknown, {}, GuestCartItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<GuestCartItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    image?: import("mongoose").SchemaDefinitionProperty<string, GuestCartItem, Document<unknown, {}, GuestCartItem, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<GuestCartItem & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, GuestCartItem>;
export declare class GuestCart {
    sessionId: string;
    items: GuestCartItem[];
}
export declare const GuestCartSchema: import("mongoose").Schema<GuestCart, import("mongoose").Model<GuestCart, any, any, any, any, any, GuestCart>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, GuestCart, Document<unknown, {}, GuestCart, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<GuestCart & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    sessionId?: import("mongoose").SchemaDefinitionProperty<string, GuestCart, Document<unknown, {}, GuestCart, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<GuestCart & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    items?: import("mongoose").SchemaDefinitionProperty<GuestCartItem[], GuestCart, Document<unknown, {}, GuestCart, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<GuestCart & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, GuestCart>;
