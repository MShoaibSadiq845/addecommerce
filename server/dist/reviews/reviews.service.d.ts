import { Model } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { NotificationsGateway } from '../notifications/notifications.gateway';
export declare class ReviewsService {
    private reviewModel;
    private readonly gateway;
    constructor(reviewModel: Model<ReviewDocument>, gateway: NotificationsGateway);
    createReview(data: {
        name: string;
        comment: string;
        rating: number;
        productId?: string;
        productName?: string;
        image?: string;
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
