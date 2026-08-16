import { Model } from 'mongoose';
import { CartDocument } from './schemas/cart.schema';
import { AddCartItemDto } from './dto/cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
export declare class CartsService {
    private cartModel;
    constructor(cartModel: Model<CartDocument>);
    getCart(userId: string): Promise<any>;
    addItem(userId: string, dto: AddCartItemDto): Promise<any>;
    updateItem(userId: string, itemId: string, dto: UpdateCartItemDto): Promise<any>;
    removeItem(userId: string, itemId: string): Promise<any>;
    clearCart(userId: string): Promise<any>;
}
