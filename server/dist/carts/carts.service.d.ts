import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { AddCartItemDto } from './dto/cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
export declare class CartsService {
    private cartModel;
    constructor(cartModel: Model<CartDocument>);
    getCart(userId: string): Promise<{
        items: any[];
    } | (import("mongoose").Document<unknown, {}, CartDocument, {}, import("mongoose").DefaultSchemaOptions> & Cart & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })>;
    addItem(userId: string, dto: AddCartItemDto): Promise<import("mongoose").Document<unknown, {}, CartDocument, {}, import("mongoose").DefaultSchemaOptions> & Cart & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateItem(userId: string, itemId: string, dto: UpdateCartItemDto): Promise<import("mongoose").Document<unknown, {}, CartDocument, {}, import("mongoose").DefaultSchemaOptions> & Cart & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    removeItem(userId: string, itemId: string, size?: string, color?: string): Promise<import("mongoose").Document<unknown, {}, CartDocument, {}, import("mongoose").DefaultSchemaOptions> & Cart & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    clearCart(userId: string): Promise<import("mongoose").Document<unknown, {}, CartDocument, {}, import("mongoose").DefaultSchemaOptions> & Cart & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
