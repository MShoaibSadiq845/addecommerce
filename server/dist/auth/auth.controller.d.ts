import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserDocument } from '../users/schemas/user.schema';
export declare class AuthController {
    private readonly authService;
    private readonly configService;
    constructor(authService: AuthService, configService: ConfigService);
    login(dto: LoginDto): Promise<import("./auth.service").AuthResponse>;
    register(dto: RegisterDto, currentUser: UserDocument | undefined): Promise<import("./auth.service").AuthResponse>;
    getMe(userId: string): Promise<{
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
    }>;
    googleAuth(): Promise<void>;
    googleAuthCallback(req: any, res: any): Promise<any>;
    githubAuth(): Promise<void>;
    githubAuthCallback(req: any, res: any): Promise<any>;
    discordAuth(): Promise<void>;
    discordAuthCallback(req: any, res: any): Promise<any>;
    private getRedirectUrl;
}
