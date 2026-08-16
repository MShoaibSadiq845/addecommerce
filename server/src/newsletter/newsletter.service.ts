import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Newsletter, NewsletterDocument } from './schemas/newsletter.schema';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectModel(Newsletter.name)
    private newsletterModel: Model<NewsletterDocument>,
  ) {}

  async subscribe(email: string) {
    const existing = await this.newsletterModel.findOne({ email });
    if (existing) {
      throw new ConflictException('This email is already subscribed.');
    }
    return this.newsletterModel.create({ email });
  }

  async getAll() {
    return this.newsletterModel.find().sort({ createdAt: -1 }).exec();
  }
}
