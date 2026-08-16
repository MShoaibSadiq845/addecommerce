import { Model } from 'mongoose';
import { GuestCartDocument } from './schemas/guest-cart.schema';
import { GuestAddCartItemDto } from './dto/guest-cart.dto';
export declare class GuestCartsService {
    private guestCartModel;
    constructor(guestCartModel: Model<GuestCartDocument>);
    /** Return the full cart for a session (creates empty cart if none exists) */
    getCart(sessionId: string): Promise<GuestCartDocument>;
    /** Add or increment an item */
    addItem(dto: GuestAddCartItemDto): Promise<GuestCartDocument>;
    /** Remove one item by its Mongo sub-document id */
    removeItem(sessionId: string, itemId: string): Promise<GuestCartDocument>;
    /** Clear all items for this session */
    clearCart(sessionId: string): Promise<GuestCartDocument>;
}
