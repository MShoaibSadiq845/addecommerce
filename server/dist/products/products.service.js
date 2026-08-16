"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const product_schema_1 = require("./schemas/product.schema");
let ProductsService = class ProductsService {
    constructor(productModel) {
        this.productModel = productModel;
    }
    normalizeArrayParam(value) {
        if (value === undefined)
            return [];
        const values = Array.isArray(value) ? value : String(value).split(',');
        return values.map((v) => v.trim()).filter(Boolean);
    }
    async findAll(query) {
        const { category, isOnSale, newArrivals, search, minPrice, maxPrice, sort, page = 1, limit = 12, color, size, } = query;
        const filters = [];
        const baseFilter = {};
        if (category) {
            baseFilter.category = { $regex: new RegExp(`^${category}$`, 'i') };
        }
        if (isOnSale !== undefined) {
            baseFilter.isOnSale =
                isOnSale === true || String(isOnSale).toLowerCase() === 'true';
        }
        if (newArrivals === true || String(newArrivals).toLowerCase() === 'true') {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            baseFilter.createdAt = { $gte: oneWeekAgo };
            baseFilter.isOnSale = { $ne: true };
        }
        if (Object.keys(baseFilter).length)
            filters.push(baseFilter);
        if (minPrice !== undefined || maxPrice !== undefined) {
            const priceConditions = [];
            if (minPrice !== undefined && maxPrice !== undefined) {
                priceConditions.push({
                    $or: [
                        { isOnSale: true, salePrice: { $gte: Number(minPrice), $lte: Number(maxPrice) } },
                        { isOnSale: { $ne: true }, price: { $gte: Number(minPrice), $lte: Number(maxPrice) } },
                    ],
                });
            }
            else if (minPrice !== undefined) {
                priceConditions.push({
                    $or: [
                        { isOnSale: true, salePrice: { $gte: Number(minPrice) } },
                        { isOnSale: { $ne: true }, price: { $gte: Number(minPrice) } },
                    ],
                });
            }
            else if (maxPrice !== undefined) {
                priceConditions.push({
                    $or: [
                        { isOnSale: true, salePrice: { $lte: Number(maxPrice) } },
                        { isOnSale: { $ne: true }, price: { $lte: Number(maxPrice) } },
                    ],
                });
            }
            if (priceConditions.length)
                filters.push(...priceConditions);
        }
        if (search) {
            filters.push({
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { brand: { $regex: search, $options: 'i' } },
                    { tags: { $in: [new RegExp(search, 'i')] } },
                ],
            });
        }
        const colors = this.normalizeArrayParam(color);
        if (colors.length) {
            filters.push({
                colors: { $in: colors.map((c) => new RegExp(c, 'i')) },
            });
        }
        const sizes = this.normalizeArrayParam(size);
        if (sizes.length) {
            filters.push({
                sizes: { $in: sizes.map((s) => new RegExp(s, 'i')) },
            });
        }
        const finalFilter = filters.length > 1 ? { $and: filters } : filters[0] || {};
        const needsPriceSorting = sort === 'price-asc' || sort === 'price-desc';
        const skip = (Number(page) - 1) * Number(limit);
        const total = await this.productModel.countDocuments(finalFilter);
        let products;
        if (needsPriceSorting) {
            const sortDirection = sort === 'price-asc' ? 1 : -1;
            products = await this.productModel.aggregate([
                { $match: finalFilter },
                {
                    $addFields: {
                        effectivePrice: {
                            $cond: {
                                if: '$isOnSale',
                                then: '$salePrice',
                                else: '$price',
                            },
                        },
                    },
                },
                { $sort: { effectivePrice: sortDirection } },
                { $skip: skip },
                { $limit: Number(limit) },
            ]).exec();
        }
        else {
            let sortOptions = { createdAt: -1 };
            if (sort === 'rating' || sort === 'most-popular')
                sortOptions = { totalSales: -1 };
            else if (sort === 'newest')
                sortOptions = { createdAt: -1 };
            products = await this.productModel
                .find(finalFilter)
                .sort(sortOptions)
                .skip(skip)
                .limit(Number(limit))
                .exec();
        }
        return {
            products,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
        };
    }
    async findById(id) {
        const product = await this.productModel.findById(id).exec();
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    async create(dto) {
        return new this.productModel(dto).save();
    }
    async update(id, dto) {
        const product = await this.productModel
            .findByIdAndUpdate(id, dto, { new: true })
            .exec();
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    async remove(id) {
        const product = await this.productModel.findByIdAndDelete(id).exec();
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return { message: 'Product removed successfully' };
    }
    async toggleSale(id, isOnSale, salePrice) {
        const updateData = { isOnSale };
        if (salePrice !== undefined)
            updateData.salePrice = salePrice;
        const product = await this.productModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .exec();
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    async getCategories() {
        return this.productModel.distinct('category').exec();
    }
    async getFilterOptions() {
        const [colors, sizes, categories] = await Promise.all([
            this.productModel.distinct('colors').exec(),
            this.productModel.distinct('sizes').exec(),
            this.productModel.distinct('category').exec(),
        ]);
        return {
            colors: colors.filter(Boolean).sort(),
            sizes: sizes.filter(Boolean).sort(),
            categories: categories.filter(Boolean).sort(),
        };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ProductsService);
//# sourceMappingURL=products.service.js.map