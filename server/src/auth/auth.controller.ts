import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GetUser } from './get-user.decorator';
import { JwtOptionalGuard } from './jwt-optional.guard';
import { UserDocument } from '../users/schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
  ) {}

  /**
   * POST /api/auth/login
   * Fully public — no guard.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * POST /api/auth/register
   * Fully public — new accounts default to role 'User'.
   * JwtOptionalGuard never rejects: if a valid Super Admin token is present
   * it populates request.user so the service can allow role elevation;
   * if no token is present the request still goes through with user = null.
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtOptionalGuard)
  async register(
    @Body() dto: RegisterDto,
    @GetUser() currentUser: UserDocument | undefined,
  ) {
    return this.authService.register(dto, currentUser);
  }

  /**
   * GET /api/auth/me
   * JWT-protected — returns the currently authenticated user's profile.
   */
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMe(@GetUser('_id') userId: string) {
    return this.authService.getMe(userId);
  }
}
