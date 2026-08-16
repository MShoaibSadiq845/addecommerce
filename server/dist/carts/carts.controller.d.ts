import { CartsService } from './carts.service';
import { AddCartItemDto } from './dto/cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
export declare class CartsController {
    private readonly cartsService;
    constructor(cartsService: CartsService);
    getCart(userId: string): Promise<{
        items: any[];
    } | (import("mongoose").Document<unknown, {}, import("./schemas/cart.schema").CartDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/cart.schema").Cart & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })>;
    addToCart(userId: string, dto: AddCartItemDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/cart.schema").CartDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/cart.schema").Cart & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateCartItem(userId: string, itemId: string, dto: UpdateCartItemDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/cart.schema").CartDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/cart.schema").Cart & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    removeCartItem(userId: string, itemId: string, size?: string, color?: string): Promise<{
        success: boolean;
        message: string;
        cart: import("mongoose").Document<unknown, {}, import("./schemas/cart.schema").CartDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/cart.schema").Cart & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
    }>;
    clearCart(userId: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/cart.schema").CartDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/cart.schema").Cart & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
