"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const XLSX = __importStar(require("xlsx"));
const products_service_1 = require("./products.service");
const create_product_dto_1 = require("./dto/create-product.dto");
const update_product_dto_1 = require("./dto/update-product.dto");
const notifications_service_1 = require("../notifications/notifications.service");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
let ProductsController = class ProductsController {
    constructor(productsService, notificationsService, cloudinaryService) {
        this.productsService = productsService;
        this.notificationsService = notificationsService;
        this.cloudinaryService = cloudinaryService;
    }
    async uploadImage(file) {
        console.log('Upload endpoint hit');
        console.log('File received:', file ? 'Yes' : 'No');
        if (!file) {
            console.error('No file in request');
            throw new Error('No file uploaded');
        }
        console.log('File details:', {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            hasBuffer: !!file.buffer,
        });
        try {
            console.log('Calling cloudinary upload...');
            const result = await this.cloudinaryService.uploadFile(file);
            console.log('Upload successful:', result.secure_url);
            return { url: result.secure_url };
        }
        catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }
    async bulkUpload(file) {
        if (!file)
            throw new common_1.BadRequestException('No file uploaded');
        const allowedMimes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv',
            'application/csv',
        ];
        if (!allowedMimes.includes(file.mimetype) && !file.originalname.match(/\.(xlsx|xls|csv)$/i)) {
            throw new common_1.BadRequestException('Only CSV or Excel files are allowed');
        }
        let rows;
        try {
            const workbook = XLSX.read(file.buffer, { type: 'buffer' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        }
        catch {
            throw new common_1.BadRequestException('Could not parse file — make sure it is a valid CSV or Excel file');
        }
        if (!rows.length)
            throw new common_1.BadRequestException('File is empty or has no data rows');
        const dtos = rows.map((r) => ({
            name: String(r['productName'] ?? r['name'] ?? '').trim(),
            description: String(r['description'] ?? '').trim(),
            price: Number(r['price'] ?? 0),
            category: String(r['category'] ?? '').trim(),
            stock: Number(r['stockQuantity'] ?? r['stock'] ?? 0),
            sku: String(r['skuCode'] ?? r['sku'] ?? '').trim(),
            colors: String(r['colors'] ?? '').split(',').map((s) => s.trim()).filter(Boolean),
            sizes: String(r['sizes'] ?? '').split(',').map((s) => s.trim()).filter(Boolean),
            images: String(r['imageUrls'] ?? r['images'] ?? '').split(',').map((s) => s.trim()).filter(Boolean),
            brand: String(r['brand'] ?? 'Fab Decor').trim(),
            rating: Number(r['rating'] ?? 4.5),
        }));
        return this.productsService.bulkUploadProducts(dtos);
    }
    async getAll(query) {
        return this.productsService.findAll(query);
    }
    async getCategories() {
        return this.productsService.getCategories();
    }
    async getFilterOptions() {
        return this.productsService.getFilterOptions();
    }
    async getLowStock() {
        return this.productsService.getLowStockProducts();
    }
    async bulkUpdatePricesPut(body) {
        const items = Array.isArray(body) ? body : body?.items || [];
        return this.productsService.bulkUpdatePrices(items);
    }
    async bulkUpdatePricesPost(body) {
        const items = Array.isArray(body) ? body : body?.items || [];
        return this.productsService.bulkUpdatePrices(items);
    }
    async getOne(id) {
        return this.productsService.findById(id);
    }
    async create(dto) {
        return this.productsService.create(dto);
    }
    async update(id, dto) {
        return this.productsService.update(id, dto);
    }
    async updatePatch(id, dto) {
        return this.productsService.update(id, dto);
    }
    async remove(id) {
        return this.productsService.remove(id);
    }
    async toggleSale(id, body) {
        const product = await this.productsService.toggleSale(id, body.isOnSale, body.salePrice);
        if (body.isOnSale) {
            await this.notificationsService.createAndBroadcast({
                title: '🔥 Flash Sale Alert!',
                message: `${product.name} is now on sale for ₨${product.salePrice || product.price}!`,
                type: 'sale',
                link: `/shop/${product._id}`,
            });
        }
        return product;
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Post)('bulk-upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "bulkUpload", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)('filter-options'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getFilterOptions", null);
__decorate([
    (0, common_1.Get)('low-stock'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getLowStock", null);
__decorate([
    (0, common_1.Put)('bulk-prices'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "bulkUpdatePricesPut", null);
__decorate([
    (0, common_1.Post)('bulk-prices'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "bulkUpdatePricesPost", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_dto_1.UpdateProductDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_dto_1.UpdateProductDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "updatePatch", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "remove", null);
__decorate([
    (0, common_1.Put)(':id/sale'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "toggleSale", null);
exports.ProductsController = ProductsController = __decorate([
    (0, common_1.Controller)('products'),
    __param(0, (0, common_1.Inject)(products_service_1.ProductsService)),
    __param(1, (0, common_1.Inject)(notifications_service_1.NotificationsService)),
    __param(2, (0, common_1.Inject)(cloudinary_service_1.CloudinaryService)),
    __metadata("design:paramtypes", [products_service_1.ProductsService, notifications_service_1.NotificationsService, cloudinary_service_1.CloudinaryService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map