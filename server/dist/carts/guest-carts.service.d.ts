import { Model } from 'mongoose';
import { GuestCartDocument } from './schemas/guest-cart.schema';
import { GuestAddCartItemDto } from './dto/guest-cart.dto';
export declare class GuestCartsService {
    private guestCartModel;
    constructor(guestCartModel: Model<GuestCartDocument>);
    getCart(sessionId: string): Promise<GuestCartDocument>;
    addItem(dto: GuestAddCartItemDto): Promise<GuestCartDocument>;
    removeItem(sessionId: string, itemId: string, size?: string, color?: string): Promise<any>;
    clearCart(sessionId: string): Promise<GuestCartDocument>;
}
