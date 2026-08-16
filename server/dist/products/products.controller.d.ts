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
        url: any;
    }>;
    getAll(query: ProductQuery): Promise<any>;
    getCategories(): Promise<any>;
    getFilterOptions(): Promise<any>;
    getOne(id: string): Promise<any>;
    create(dto: CreateProductDto): Promise<any>;
    update(id: string, dto: UpdateProductDto): Promise<any>;
    remove(id: string): Promise<any>;
    toggleSale(id: string, body: {
        isOnSale: boolean;
        salePrice?: number;
    }): Promise<any>;
}
