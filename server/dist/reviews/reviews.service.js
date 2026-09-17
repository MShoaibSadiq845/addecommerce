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
var ReviewsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const review_schema_1 = require("./schemas/review.schema");
const product_schema_1 = require("../products/schemas/product.schema");
const notifications_gateway_1 = require("../notifications/notifications.gateway");
const default_reviews_data_1 = require("./default-reviews.data");
let ReviewsService = ReviewsService_1 = class ReviewsService {
    constructor(reviewModel, productModel, gateway) {
        this.reviewModel = reviewModel;
        this.productModel = productModel;
        this.gateway = gateway;
        this.logger = new common_1.Logger(ReviewsService_1.name);
    }
    async onModuleInit() {
        try {
            this.logger.log('Starting background audit for product reviews...');
            const result = await this.auditAndPopulateDefaultReviews();
            this.logger.log(`Reviews audit completed: ${result.auditedProducts} products checked, ${result.updatedProducts} updated with ${result.createdReviews} default Roman Urdu reviews.`);
        }
        catch (error) {
            this.logger.error('Error during startup reviews audit:', error);
        }
    }
    async recalculateProductRating(productId) {
        if (!productId)
            return;
        try {
            const reviews = await this.reviewModel
                .find({ productId })
                .select('rating')
                .exec();
            if (reviews.length === 0) {
                await this.productModel
                    .findByIdAndUpdate(productId, { rating: 5.0, numReviews: 0 })
                    .exec();
                return;
            }
            const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
            const avgRating = Math.round((totalRating / reviews.length) * 10) / 10;
            await this.productModel
                .findByIdAndUpdate(productId, {
                rating: avgRating,
                numReviews: reviews.length,
            })
                .exec();
        }
        catch (err) {
            this.logger.warn(`Failed to recalculate rating for product ${productId}:`, err);
        }
    }
    async generateDefaultReviewsForProduct(productId, productName, seedOffset = 0) {
        const existingReviews = await this.reviewModel.find({ productId }).exec();
        const existingCount = existingReviews.length;
        if (existingCount >= 7) {
            return existingReviews;
        }
        const existingNames = existingReviews.map((r) => r.name || r.user_name || '');
        const existingComments = existingReviews.map((r) => r.comment || '');
        const neededCount = 7 - existingCount;
        const reviewsToInsert = (0, default_reviews_data_1.buildDefaultReviews)(productId, productName, seedOffset, neededCount, existingNames, existingComments);
        const created = await this.reviewModel.insertMany(reviewsToInsert);
        await this.recalculateProductRating(productId);
        return created;
    }
    async auditAndPopulateDefaultReviews() {
        const products = await this.productModel.find().exec();
        let updatedProducts = 0;
        let createdReviews = 0;
        for (let i = 0; i < products.length; i++) {
            const prod = products[i];
            const pId = prod._id.toString();
            const existingReviews = await this.reviewModel.find({ productId: pId }).exec();
            const seenNames = new Set();
            let hasDuplicates = false;
            for (const r of existingReviews) {
                const key = (r.name || r.user_name || '').trim().toLowerCase();
                if (seenNames.has(key)) {
                    hasDuplicates = true;
                    break;
                }
                seenNames.add(key);
            }
            if (hasDuplicates || existingReviews.length < 7) {
                await this.reviewModel.deleteMany({ productId: pId });
                const freshReviews = (0, default_reviews_data_1.buildDefaultReviews)(pId, prod.name || 'Product', i, 7, [], []);
                await this.reviewModel.insertMany(freshReviews);
                createdReviews += freshReviews.length;
                updatedProducts++;
                await this.recalculateProductRating(pId);
            }
        }
        return {
            auditedProducts: products.length,
            updatedProducts,
            createdReviews,
        };
    }
    async createReview(data) {
        const reviewerName = data.name || data.user_name || 'Customer';
        const images = data.images && data.images.length > 0
            ? data.images
            : data.image
                ? [data.image]
                : [];
        const mainImage = data.image || (images.length > 0 ? images[0] : undefined);
        const review = await this.reviewModel.create({
            ...data,
            name: reviewerName,
            user_name: reviewerName,
            image: mainImage,
            images,
        });
        if (data.productId) {
            await this.recalculateProductRating(data.productId);
        }
        this.gateway.broadcastReview(review);
        return review;
    }
    async getReviewsByProduct(productId) {
        return this.reviewModel
            .find({ productId })
            .sort({ createdAt: -1 })
            .exec();
    }
    async getAllReviews() {
        return this.reviewModel
            .find()
            .sort({ createdAt: -1 })
            .exec();
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = ReviewsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(review_schema_1.Review.name)),
    __param(1, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __param(2, (0, common_1.Inject)(notifications_gateway_1.NotificationsGateway)),
    __metadata("design:paramtypes", [mongoose_2.Model, mongoose_2.Model, notifications_gateway_1.NotificationsGateway])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map