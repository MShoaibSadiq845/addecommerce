var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f;
import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject, UseInterceptors, UploadedFile, } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService, ProductQuery } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
// No authentication on any route — fully public API
let ProductsController = class ProductsController {
    productsService;
    notificationsService;
    cloudinaryService;
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
    async getAll(query) {
        return this.productsService.findAll(query);
    }
    async getCategories() {
        return this.productsService.getCategories();
    }
    async getFilterOptions() {
        return this.productsService.getFilterOptions();
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
__decorate([
    Post('upload'),
    UseInterceptors(FileInterceptor('file')),
    __param(0, UploadedFile()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "uploadImage", null);
__decorate([
    Get(),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof ProductQuery !== "undefined" && ProductQuery) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getAll", null);
__decorate([
    Get('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getCategories", null);
__decorate([
    Get('filter-options'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getFilterOptions", null);
__decorate([
    Get(':id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getOne", null);
__decorate([
    Post(),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof CreateProductDto !== "undefined" && CreateProductDto) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "create", null);
__decorate([
    Put(':id'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_f = typeof UpdateProductDto !== "undefined" && UpdateProductDto) === "function" ? _f : Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "update", null);
__decorate([
    Delete(':id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "remove", null);
__decorate([
    Put(':id/sale'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "toggleSale", null);
ProductsController = __decorate([
    Controller('products'),
    __param(0, Inject(ProductsService)),
    __param(1, Inject(NotificationsService)),
    __param(2, Inject(CloudinaryService)),
    __metadata("design:paramtypes", [typeof (_a = typeof ProductsService !== "undefined" && ProductsService) === "function" ? _a : Object, typeof (_b = typeof NotificationsService !== "undefined" && NotificationsService) === "function" ? _b : Object, typeof (_c = typeof CloudinaryService !== "undefined" && CloudinaryService) === "function" ? _c : Object])
], ProductsController);
export { ProductsController };
//# sourceMappingURL=products.controller.js.map