import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { UserDocument } from '../users/schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export interface AuthResponse {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        loyaltyPoints: number;
        avatar: string;
        phone?: string;
        address?: string;
    };
}
export declare class AuthService {
    private userModel;
    private jwtService;
    constructor(userModel: Model<UserDocument>, jwtService: JwtService);
    login(dto: LoginDto): Promise<AuthResponse>;
    register(dto: RegisterDto, registeredBy?: UserDocument): Promise<AuthResponse>;
    getMe(userId: string): Promise<AuthResponse['user']>;
    private buildAuthResponse;
    private serializeUser;
}
