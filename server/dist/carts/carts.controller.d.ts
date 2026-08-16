import { CartsService } from './carts.service';
import { AddCartItemDto } from './dto/cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
export declare class CartsController {
    private readonly cartsService;
    constructor(cartsService: CartsService);
    getCart(userId: string): Promise<any>;
    addToCart(userId: string, dto: AddCartItemDto): Promise<any>;
    updateCartItem(userId: string, itemId: string, dto: UpdateCartItemDto): Promise<any>;
    removeCartItem(userId: string, itemId: string): Promise<any>;
    clearCart(userId: string): Promise<any>;
}
