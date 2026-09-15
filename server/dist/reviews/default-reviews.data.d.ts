export declare const PAKISTANI_BOY_NAMES: string[];
export declare const PAKISTANI_GIRL_NAMES: string[];
export declare const ROMAN_URDU_5_STAR_COMMENTS: string[];
export declare const ROMAN_URDU_4_STAR_COMMENTS: string[];
export declare const RATING_PATTERNS: number[][];
export interface DefaultReviewItem {
    name: string;
    user_name: string;
    rating: number;
    comment: string;
    productId: string;
    productName: string;
    createdAt: Date;
    created_at?: Date;
}
export declare function buildDefaultReviews(productId: string, productName: string, seedOffset?: number): DefaultReviewItem[];
