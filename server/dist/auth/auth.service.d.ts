import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { UserDocument } from '../users/schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export interface SocialUserDto {
    email: string;
    name: string;
    avatar: string;
    provider: 'google' | 'github' | 'discord';
    providerId: string;
}
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
        provider?: string;
        providerId?: string;
        lastLogin?: Date;
        linkedProviders?: Array<{
            provider: string;
            providerId: string;
        }>;
    };
}
export declare class AuthService {
    private userModel;
    private jwtService;
    constructor(userModel: Model<UserDocument>, jwtService: JwtService);
    login(dto: LoginDto): Promise<AuthResponse>;
    register(dto: RegisterDto, registeredBy?: UserDocument): Promise<AuthResponse>;
    validateSocialUser(socialUser: SocialUserDto): Promise<AuthResponse>;
    getMe(userId: string): Promise<AuthResponse['user']>;
    buildAuthResponse(user: UserDocument): AuthResponse;
    serializeUser(user: UserDocument): AuthResponse['user'];
}
