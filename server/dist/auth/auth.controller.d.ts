import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserDocument } from '../users/schemas/user.schema';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    }>;
}
