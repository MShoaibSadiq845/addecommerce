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
    @Inject(NotificationsGateway) // 👈 Explicitly Inject NotificationsGateway
    private readonly gateway: NotificationsGateway,
  ) {}

  async createReview(data: {
    name: string;
    comment: string;
    rating: number;
    productId?: string;
    productName?: string;
  }) {
    const review = await this.reviewModel.create(data);
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