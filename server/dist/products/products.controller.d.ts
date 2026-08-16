import { ProductsService, ProductQuery } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class ProductsController {
    private readonly productsService;
    private readonly notificationsService;
    private readonly cloudinaryService;
    constructor(productsService: ProductsService, notificationsService: NotificationsService, cloudinaryService: CloudinaryService);
    uploadImage(file: Express.Multer.File): Promise<{
        url: string;
    }>;
    getAll(query: ProductQuery): Promise<{
        products: import("./schemas/product.schema").ProductDocument[];
        total: number;
        page: number;
        pages: number;
    }>;
    getCategories(): Promise<string[]>;
    getFilterOptions(): Promise<{
        colors: string[];
        sizes: string[];
        categories: string[];
    }>;
    getOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/product.schema").ProductDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/product.schema").Product & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    create(dto: CreateProductDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/product.schema").ProductDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/product.schema").Product & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, dto: UpdateProductDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/product.schema").ProductDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/product.schema").Product & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    toggleSale(id: string, body: {
        isOnSale: boolean;
        salePrice?: number;
    }): Promise<import("mongoose").Document<unknown, {}, import("./schemas/product.schema").ProductDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/product.schema").Product & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
