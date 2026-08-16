import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { UserDocument } from '../users/schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
/** Shape returned by every auth endpoint */
export interface AuthResponse {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        loyaltyPoints: number;
        avatar: string;
    };
}
export declare class AuthService {
    private userModel;
    private jwtService;
    constructor(userModel: Model<UserDocument>, jwtService: JwtService);
    login(dto: LoginDto): Promise<AuthResponse>;
    /**
     * registeredBy is the currently-authenticated user (undefined for public calls).
     * Admin / Super Admin roles can only be assigned by a Super Admin.
     * All other callers get the 'User' role regardless of what they send.
     */
    register(dto: RegisterDto, registeredBy?: UserDocument): Promise<AuthResponse>;
    getMe(userId: string): Promise<AuthResponse['user']>;
    private buildAuthResponse;
    private serializeUser;
}
