export declare class BulkPriceItemDto {
    id: string;
    price: number;
    salePrice?: number;
    isOnSale?: boolean;
}
export declare class BulkUpdatePricesDto {
    items: BulkPriceItemDto[];
}
