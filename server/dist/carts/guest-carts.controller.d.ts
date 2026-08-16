import { GuestCartsService } from './guest-carts.service';
import { GuestAddCartItemDto } from './dto/guest-cart.dto';
/** Public cart endpoints — no authentication required.
 *  The client generates a UUID (sessionId) stored in localStorage
 *  and passes it with every request. */
export declare class GuestCartsController {
    private readonly guestCartsService;
    constructor(guestCartsService: GuestCartsService);
    /** GET /guest-cart?sessionId=<uuid> */
    getCart(sessionId: string): Promise<any>;
    /** POST /guest-cart  — body includes sessionId + item fields */
    addItem(dto: GuestAddCartItemDto): Promise<any>;
    /** DELETE /guest-cart/:itemId?sessionId=<uuid> */
    removeItem(itemId: string, sessionId: string): Promise<any>;
    /** DELETE /guest-cart?sessionId=<uuid>  — clears whole cart */
    clearCart(sessionId: string): Promise<any>;
}
