import { Document } from 'mongoose';
export type CouponDocument = Coupon & Document;
export declare class Coupon {
    code: string;
    discountPercentage: number;
    isActive: boolean;
}
export declare const CouponSchema: import("mongoose").Schema<Coupon, import("mongoose").Model<Coupon, any, any, any, any, any, Coupon>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Coupon, Document<unknown, {}, Coupon, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Coupon & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    code?: import("mongoose").SchemaDefinitionProperty<string, Coupon, Document<unknown, {}, Coupon, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Coupon & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    discountPercentage?: import("mongoose").SchemaDefinitionProperty<number, Coupon, Document<unknown, {}, Coupon, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Coupon & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    isActive?: import("mongoose").SchemaDefinitionProperty<boolean, Coupon, Document<unknown, {}, Coupon, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Coupon & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, Coupon>;
