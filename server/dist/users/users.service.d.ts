import { Model } from 'mongoose';
import { UserDocument } from './schemas/user.schema';
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    findAll(): Promise<any[]>;
    findById(id: string): Promise<any>;
    getLoyaltyPoints(id: string): Promise<{
        loyaltyPoints: any;
    }>;
    addLoyaltyPoints(id: string, points: number): Promise<any>;
}
