import { Model } from 'mongoose';
import { ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export interface ProductQuery {
    category?: string;
    isOnSale?: boolean | string;
    newArrivals?: boolean | string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    page?: number;
    limit?: number;
    color?: string | string[];
    size?: string | string[];
}
export declare class ProductsService {
    private productModel;
    constructor(productModel: Model<ProductDocument>);
    private normalizeArrayParam;
    findAll(query: ProductQuery): Promise<{
        products: ProductDocument[];
        total: number;
        page: number;
        pages: number;
    }>;
    findById(id: string): Promise<any>;
    create(dto: CreateProductDto): Promise<any>;
    update(id: string, dto: UpdateProductDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
    toggleSale(id: string, isOnSale: boolean, salePrice?: number): Promise<any>;
    getCategories(): Promise<string[]>;
    getFilterOptions(): Promise<{
        colors: any[];
        sizes: any[];
        categories: any[];
    }>;
}
