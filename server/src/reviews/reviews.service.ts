import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name)
    private reviewModel: Model<ReviewDocument>,
    @Inject(NotificationsGateway)
    private readonly gateway: NotificationsGateway,
  ) {}

  async createReview(data: {
    name: string;
    comment: string;
    rating: number;
    productId?: string;
    productName?: string;
    image?: string;
    images?: string[];
  }) {
    const images = data.images && data.images.length > 0
      ? data.images
      : data.image
      ? [data.image]
      : [];
    const mainImage = data.image || (images.length > 0 ? images[0] : undefined);

    const review = await this.reviewModel.create({
      ...data,
      image: mainImage,
      images,
    });
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