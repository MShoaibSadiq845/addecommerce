import { Controller, Post, Get, Body, Query, Inject } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(
    @Inject(ReviewsService) // 👈 Explicitly Inject ReviewsService
    private readonly reviewsService: ReviewsService,
  ) {}

  @Post()
  async createReview(
    @Body()
    body: {
      name: string;
      comment: string;
      rating: number;
      productId?: string;
      productName?: string;
    },
  ) {
    return this.reviewsService.createReview(body);
  }

  @Get()
  async getReviews(@Query('productId') productId: string) {
    if (productId) {
      return this.reviewsService.getReviewsByProduct(productId);
    }
    return this.reviewsService.getAllReviews();
  }

  @Get('all')
  async getAllReviews() {
    return this.reviewsService.getAllReviews();
  }
}