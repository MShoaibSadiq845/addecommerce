import { GuestCartsService } from './guest-carts.service';
import { GuestAddCartItemDto } from './dto/guest-cart.dto';
export declare class GuestCartsController {
    private readonly guestCartsService;
    constructor(guestCartsService: GuestCartsService);
    getCart(sessionId: string): Promise<import("./schemas/guest-cart.schema").GuestCartDocument>;
    addItem(dto: GuestAddCartItemDto): Promise<import("./schemas/guest-cart.schema").GuestCartDocument>;
    removeItem(itemId: string, sessionId: string, size?: string, color?: string): Promise<{
        success: boolean;
        message: string;
        cart: import("./schemas/guest-cart.schema").GuestCartDocument;
    }>;
    clearCart(sessionId: string): Promise<import("./schemas/guest-cart.schema").GuestCartDocument>;
}
