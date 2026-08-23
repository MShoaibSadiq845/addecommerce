import { ReviewsService } from './reviews.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class ReviewsController {
    private readonly reviewsService;
    private readonly cloudinaryService;
    constructor(reviewsService: ReviewsService, cloudinaryService: CloudinaryService);
    uploadReviewImage(file: Express.Multer.File): Promise<{
        url: string;
    }>;
    createReview(body: {
        name: string;
        comment: string;
        rating: number;
        productId?: string;
        productName?: string;
        image?: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("./schemas/review.schema").ReviewDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/review.schema").Review & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getReviews(productId: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/review.schema").ReviewDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/review.schema").Review & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getAllReviews(): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/review.schema").ReviewDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/review.schema").Review & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
}
