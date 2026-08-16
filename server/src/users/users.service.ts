import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll() {
    return this.userModel.find().select('-password').exec();
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getLoyaltyPoints(id: string) {
    const user = await this.findById(id);
    return { loyaltyPoints: user.loyaltyPoints };
  }

  async addLoyaltyPoints(id: string, points: number) {
    const user = await this.userModel
      .findByIdAndUpdate(id, { $inc: { loyaltyPoints: points } }, { new: true })
      .select('-password');
    return user;
  }

  async updateProfile(
    id: string,
    updateData: { name?: string; phone?: string; address?: string; avatar?: string },
  ) {
    const user = await this.userModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .select('-password')
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
