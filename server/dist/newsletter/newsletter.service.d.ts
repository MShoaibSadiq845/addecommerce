import { Model } from 'mongoose';
import { Newsletter, NewsletterDocument } from './schemas/newsletter.schema';
export declare class NewsletterService {
    private newsletterModel;
    constructor(newsletterModel: Model<NewsletterDocument>);
    subscribe(email: string): Promise<import("mongoose").Document<unknown, {}, NewsletterDocument, {}, import("mongoose").DefaultSchemaOptions> & Newsletter & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getAll(): Promise<(import("mongoose").Document<unknown, {}, NewsletterDocument, {}, import("mongoose").DefaultSchemaOptions> & Newsletter & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
}
