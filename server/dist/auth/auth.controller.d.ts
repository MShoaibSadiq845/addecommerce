import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserDocument } from '../users/schemas/user.schema';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    /**
     * POST /api/auth/login
     * Fully public — no guard.
     */
    login(dto: LoginDto): Promise<any>;
    /**
     * POST /api/auth/register
     * Fully public — new accounts default to role 'User'.
     * JwtOptionalGuard never rejects: if a valid Super Admin token is present
     * it populates request.user so the service can allow role elevation;
     * if no token is present the request still goes through with user = null.
     */
    register(dto: RegisterDto, currentUser: UserDocument | undefined): Promise<any>;
    /**
     * GET /api/auth/me
     * JWT-protected — returns the currently authenticated user's profile.
     */
    getMe(userId: string): Promise<any>;
}
