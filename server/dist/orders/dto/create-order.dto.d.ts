export declare class OrderItemDto {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    color?: string;
    size?: string;
    image?: string;
}
export declare class ShippingAddressDto {
    street: string;
    city: string;
    province?: string;
    postalCode: string;
    country: string;
}
export declare class CreateOrderDto {
    guestName: string;
    guestEmail: string;
    items: OrderItemDto[];
    shippingAddress: ShippingAddressDto;
}
