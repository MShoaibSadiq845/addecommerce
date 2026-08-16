import { NewsletterService } from './newsletter.service';
export declare class NewsletterController {
    private readonly newsletterService;
    constructor(newsletterService: NewsletterService);
    subscribe(email: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/newsletter.schema").NewsletterDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/newsletter.schema").Newsletter & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getAll(): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/newsletter.schema").NewsletterDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/newsletter.schema").Newsletter & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
}
