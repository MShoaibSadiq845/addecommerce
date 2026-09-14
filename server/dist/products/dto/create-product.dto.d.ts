export declare class CreateProductDto {
    name: string;
    description: string;
    price: number;
    salePrice?: number;
    isOnSale?: boolean;
    category: string;
    brand?: string;
    colors?: string[];
    sizes?: string[];
    stock: number;
    sku: string;
    images?: string[];
    tags?: string[];
    seatPricing?: Record<string, number>;
    rating?: number;
}
