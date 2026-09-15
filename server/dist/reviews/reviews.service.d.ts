import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { ProductDocument } from '../products/schemas/product.schema';
import { NotificationsGateway } from '../notifications/notifications.gateway';
export declare class ReviewsService implements OnModuleInit {
    private reviewModel;
    private productModel;
    private readonly gateway;
    private readonly logger;
    constructor(reviewModel: Model<ReviewDocument>, productModel: Model<ProductDocument>, gateway: NotificationsGateway);
    onModuleInit(): Promise<void>;
    recalculateProductRating(productId: string): Promise<void>;
    generateDefaultReviewsForProduct(productId: string, productName: string, seedOffset?: number): Promise<(Omit<import("mongoose").Document<unknown, {}, ReviewDocument, {}, import("mongoose").DefaultSchemaOptions> & Review & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, keyof import("./default-reviews.data").DefaultReviewItem> & Omit<import("./default-reviews.data").DefaultReviewItem, "_id">)[] | (import("mongoose").Document<unknown, {}, ReviewDocument, {}, import("mongoose").DefaultSchemaOptions> & Review & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    auditAndPopulateDefaultReviews(): Promise<{
        auditedProducts: number;
        updatedProducts: number;
        createdReviews: number;
    }>;
    createReview(data: {
        name: string;
        user_name?: string;
        comment: string;
        rating: number;
        productId?: string;
        productName?: string;
        image?: string;
        images?: string[];
    }): Promise<import("mongoose").Document<unknown, {}, ReviewDocument, {}, import("mongoose").DefaultSchemaOptions> & Review & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getReviewsByProduct(productId: string): Promise<(import("mongoose").Document<unknown, {}, ReviewDocument, {}, import("mongoose").DefaultSchemaOptions> & Review & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getAllReviews(): Promise<(import("mongoose").Document<unknown, {}, ReviewDocument, {}, import("mongoose").DefaultSchemaOptions> & Review & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
}
