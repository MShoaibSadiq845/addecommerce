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
const reviews_service_1 = require("../reviews/reviews.service");
let ProductsService = class ProductsService {
    constructor(productModel, reviewsService) {
        this.productModel = productModel;
        this.reviewsService = reviewsService;
    }
    async onModuleInit() {
        try {
            await this.productModel.updateMany({ brand: { $in: ['SHOP.CO', 'shop.co', 'FebDecore', '', null] } }, { $set: { brand: 'Fab Decor' } });
            const sofaProducts = await this.productModel.find({
                $or: [
                    { name: { $regex: /sofa/i } },
                    { category: { $regex: /sofa/i } },
                    { tags: { $in: [/sofa/i] } },
                    { seatPricing: { $exists: true, $ne: {} } },
                ],
            }).exec();
            const SEAT_TIERS = {
                '1 seats': 1,
                '2 seats': 2,
                '3 seats': 3,
                '2(1+1)': 2,
                '5(3+1+1)': 5,
                '5(3+2)': 5,
                '6(3+2+1)': 6,
                '7(3+2+1+1)': 7,
            };
            for (const prod of sofaProducts) {
                const basePrice = Number(prod.price) || 0;
                if (basePrice > 0) {
                    const currentSeat1 = Number(prod.seatPricing?.['1 seats']) || 0;
                    const needsSync = !prod.seatPricing ||
                        Object.keys(prod.seatPricing).length < 8 ||
                        currentSeat1 !== basePrice;
                    if (needsSync) {
                        const updatedSeatPricing = {};
                        Object.entries(SEAT_TIERS).forEach(([key, multiplier]) => {
                            updatedSeatPricing[key] = basePrice * multiplier;
                        });
                        let updatedDesc = prod.description;
                        if (updatedDesc && /Price:\s*Rs\.?\s*\d+\s*per seat/i.test(updatedDesc)) {
                            updatedDesc = updatedDesc.replace(/Price:\s*Rs\.?\s*\d+\s*per seat/gi, `Price: Rs. ${basePrice} per seat`);
                        }
                        await this.productModel.updateOne({ _id: prod._id }, {
                            $set: {
                                seatPricing: updatedSeatPricing,
                                ...(updatedDesc !== prod.description ? { description: updatedDesc } : {}),
                            },
                        }).exec();
                    }
                }
            }
            console.log('✅ Sofa product seatPricing synchronized successfully.');
        }
        catch (err) {
            console.error('Failed to migrate product brands/seatPricing to Fab Decor:', err);
        }
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
        const product = await new this.productModel(dto).save();
        try {
            if (this.reviewsService) {
                await this.reviewsService.generateDefaultReviewsForProduct(product._id.toString(), product.name);
            }
        }
        catch (err) {
            console.error('Failed to attach default reviews on product creation:', err);
        }
        const updatedProduct = await this.productModel.findById(product._id).exec();
        return updatedProduct || product;
    }
    async update(id, dto) {
        const existing = await this.productModel.findById(id).exec();
        if (!existing)
            throw new common_1.NotFoundException('Product not found');
        const updateData = { ...dto };
        if (dto.price !== undefined) {
            const newPrice = Number(dto.price);
            updateData.price = newPrice;
            const isSofa = (existing.seatPricing && Object.keys(existing.seatPricing).length > 0) ||
                /sofa/i.test(existing.name || '') ||
                /sofa/i.test(existing.category || '') ||
                (existing.tags && existing.tags.some((t) => /sofa/i.test(t)));
            if (isSofa && !dto.seatPricing) {
                const SEAT_TIERS = {
                    '1 seats': 1,
                    '2 seats': 2,
                    '3 seats': 3,
                    '2(1+1)': 2,
                    '5(3+1+1)': 5,
                    '5(3+2)': 5,
                    '6(3+2+1)': 6,
                    '7(3+2+1+1)': 7,
                };
                const updatedSeatPricing = {};
                Object.entries(SEAT_TIERS).forEach(([key, mult]) => {
                    updatedSeatPricing[key] = newPrice * mult;
                });
                updateData.seatPricing = updatedSeatPricing;
                if (existing.description && /Price:\s*Rs\.?\s*\d+\s*per seat/i.test(existing.description)) {
                    updateData.description = existing.description.replace(/Price:\s*Rs\.?\s*\d+\s*per seat/gi, `Price: Rs. ${newPrice} per seat`);
                }
            }
        }
        const product = await this.productModel
            .findByIdAndUpdate(id, updateData, { returnDocument: 'after' })
            .exec();
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
            .findByIdAndUpdate(id, updateData, { returnDocument: 'after' })
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
    async getLowStockProducts(threshold = 6) {
        return this.productModel
            .find({ stock: { $lt: threshold } })
            .select('name stock sku images price category')
            .sort({ stock: 1 })
            .exec();
    }
    async bulkUpdatePrices(items) {
        if (!items || !Array.isArray(items) || items.length === 0) {
            return { success: true, count: 0, matchedCount: 0, modifiedCount: 0, message: 'No items to update' };
        }
        const SEAT_TIERS = {
            '1 seats': 1,
            '2 seats': 2,
            '3 seats': 3,
            '2(1+1)': 2,
            '5(3+1+1)': 5,
            '5(3+2)': 5,
            '6(3+2+1)': 6,
            '7(3+2+1+1)': 7,
        };
        const ids = items.map((item) => item.id);
        const existingProducts = await this.productModel.find({ _id: { $in: ids } }).exec();
        const productMap = new Map(existingProducts.map((p) => [p._id.toString(), p]));
        const bulkOps = [];
        for (const item of items) {
            const existing = productMap.get(item.id);
            if (!existing)
                continue;
            const newPrice = Number(item.price);
            if (isNaN(newPrice) || newPrice < 0)
                continue;
            const updateFields = {
                price: newPrice,
            };
            if (item.salePrice !== undefined) {
                updateFields.salePrice = Number(item.salePrice);
            }
            if (item.isOnSale !== undefined) {
                updateFields.isOnSale = Boolean(item.isOnSale);
            }
            const isSofa = (existing.seatPricing && Object.keys(existing.seatPricing).length > 0) ||
                /sofa/i.test(existing.name || '') ||
                /sofa/i.test(existing.category || '') ||
                (existing.tags && existing.tags.some((t) => /sofa/i.test(t)));
            if (isSofa) {
                const updatedSeatPricing = {};
                Object.entries(SEAT_TIERS).forEach(([key, mult]) => {
                    updatedSeatPricing[key] = newPrice * mult;
                });
                updateFields.seatPricing = updatedSeatPricing;
                if (existing.description && /Price:\s*Rs\.?\s*\d+\s*per seat/i.test(existing.description)) {
                    updateFields.description = existing.description.replace(/Price:\s*Rs\.?\s*\d+\s*per seat/gi, `Price: Rs. ${newPrice} per seat`);
                }
            }
            bulkOps.push({
                updateOne: {
                    filter: { _id: item.id },
                    update: { $set: updateFields },
                },
            });
        }
        if (bulkOps.length === 0) {
            return { success: true, count: 0, matchedCount: 0, modifiedCount: 0, message: 'No valid operations' };
        }
        const result = await this.productModel.bulkWrite(bulkOps);
        return {
            success: true,
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount,
            message: `Successfully updated ${result.modifiedCount} product price(s) in bulk.`,
        };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => reviews_service_1.ReviewsService))),
    __metadata("design:paramtypes", [mongoose_2.Model, reviews_service_1.ReviewsService])
], ProductsService);
//# sourceMappingURL=products.service.js.map