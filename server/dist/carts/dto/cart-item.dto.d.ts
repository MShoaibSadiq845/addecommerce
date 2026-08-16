export declare class CartItemDto {
    productId: string;
    name: string;
    price: number;
    pointsPrice?: number;
    quantity: number;
    paymentMethod?: 'currency' | 'points';
    size?: string;
    color?: string;
    image?: string;
}
export declare class AddCartItemDto extends CartItemDto {
}
