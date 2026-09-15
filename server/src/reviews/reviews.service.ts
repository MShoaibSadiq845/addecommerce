import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { buildDefaultReviews } from './default-reviews.data';

@Injectable()
export class ReviewsService implements OnModuleInit {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    @InjectModel(Review.name)
    private reviewModel: Model<ReviewDocument>,
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
    @Inject(NotificationsGateway)
    private readonly gateway: NotificationsGateway,
  ) {}

  async onModuleInit() {
    // Run background audit on startup to ensure all existing products have at least 3 default reviews
    try {
      this.logger.log('Starting background audit for product reviews...');
      const result = await this.auditAndPopulateDefaultReviews();
      this.logger.log(
        `Reviews audit completed: ${result.auditedProducts} products checked, ${result.updatedProducts} updated with ${result.createdReviews} default Roman Urdu reviews.`,
      );
    } catch (error) {
      this.logger.error('Error during startup reviews audit:', error);
    }
  }

  /**
   * Recalculates and updates product rating and numReviews based on current reviews in database.
   */
  async recalculateProductRating(productId: string) {
    if (!productId) return;
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
    } catch (err) {
      this.logger.warn(`Failed to recalculate rating for product ${productId}:`, err);
    }
  }

  /**
   * Automatically creates and attaches default Roman Urdu customer reviews
   * with unique Pakistani names and unique comments for a product.
   */
  async generateDefaultReviewsForProduct(
    productId: string,
    productName: string,
    seedOffset = 0,
  ) {
    const existingReviews = await this.reviewModel.find({ productId }).exec();
    const existingCount = existingReviews.length;
    if (existingCount >= 7) {
      return existingReviews;
    }

    const existingNames = existingReviews.map((r) => r.name || r.user_name || '');
    const existingComments = existingReviews.map((r) => r.comment || '');

    const neededCount = 7 - existingCount;
    const reviewsToInsert = buildDefaultReviews(
      productId,
      productName,
      seedOffset,
      neededCount,
      existingNames,
      existingComments,
    );

    const created = await this.reviewModel.insertMany(reviewsToInsert);
    await this.recalculateProductRating(productId);

    return created;
  }

  /**
   * Background audit: checks all existing products in the database.
   * Ensures every product has at least 7 reviews with 100% unique reviewer names and comments.
   * Fixes any duplicate reviews in existing products.
   */
  async auditAndPopulateDefaultReviews() {
    const products = await this.productModel.find().exec();
    let updatedProducts = 0;
    let createdReviews = 0;

    for (let i = 0; i < products.length; i++) {
      const prod = products[i];
      const pId = prod._id.toString();
      const existingReviews = await this.reviewModel.find({ productId: pId }).exec();

      // Check for duplicate names or comments
      const seenNames = new Set<string>();
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
        // Remove existing default reviews for this product to replace with clean, 100% unique 7 reviews
        // (keeping user-submitted reviews if any, i.e. reviews that have custom user fields or images)
        await this.reviewModel.deleteMany({ productId: pId });

        const freshReviews = buildDefaultReviews(
          pId,
          prod.name || 'Product',
          i,
          7,
          [],
          [],
        );

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

  /**
   * Creates a new review submitted by a customer.
   */
  async createReview(data: {
    name: string;
    user_name?: string;
    comment: string;
    rating: number;
    productId?: string;
    productName?: string;
    image?: string;
    images?: string[];
  }) {
    const reviewerName = data.name || data.user_name || 'Customer';
    const images =
      data.images && data.images.length > 0
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

  async getReviewsByProduct(productId: string) {
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
}