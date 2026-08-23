import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Inject,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReviewsService } from './reviews.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('reviews')
export class ReviewsController {
  constructor(
    @Inject(ReviewsService)
    private readonly reviewsService: ReviewsService,
    @Inject(CloudinaryService)
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadReviewImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }
    const result = await this.cloudinaryService.uploadFile(file);
    return { url: result.secure_url };
  }

  @Post()
  async createReview(
    @Body()
    body: {
      name: string;
      comment: string;
      rating: number;
      productId?: string;
      productName?: string;
      image?: string;
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