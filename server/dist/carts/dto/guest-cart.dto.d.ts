export declare class GuestAddCartItemDto {
    sessionId: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
    image?: string;
}
export declare class GuestRemoveCartItemDto {
    sessionId: string;
}
