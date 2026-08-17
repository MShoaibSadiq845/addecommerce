import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Inject,
  Req,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
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
    @Inject(ConfigService) private readonly configService: ConfigService,
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
   * JWT-protected — returns current user profile.
   */
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMe(@GetUser('_id') userId: string) {
    return this.authService.getMe(userId);
  }

  // ── GOOGLE OAUTH ──────────────────────────────────────────────────────────
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates Google OAuth2 redirect flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: any, @Res() res: any) {
    const authResult = await this.authService.validateSocialUser(req.user);
    return res.redirect(this.getRedirectUrl(req, authResult));
  }

  // ── GITHUB OAUTH ──────────────────────────────────────────────────────────
  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {
    // Initiates GitHub OAuth2 redirect flow
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(@Req() req: any, @Res() res: any) {
    const authResult = await this.authService.validateSocialUser(req.user);
    return res.redirect(this.getRedirectUrl(req, authResult));
  }

  // ── DISCORD OAUTH ─────────────────────────────────────────────────────────
  @Get('discord')
  @UseGuards(AuthGuard('discord'))
  async discordAuth() {
    // Initiates Discord OAuth2 redirect flow
  }

  @Get('discord/callback')
  @UseGuards(AuthGuard('discord'))
  async discordAuthCallback(@Req() req: any, @Res() res: any) {
    const authResult = await this.authService.validateSocialUser(req.user);
    return res.redirect(this.getRedirectUrl(req, authResult));
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  private getRedirectUrl(req: any, authResult: any): string {
    const host = req.headers.host || '';
    let clientBase = this.configService.get<string>('CLIENT_URL') || 'http://localhost:3000';
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      clientBase = 'http://localhost:3000';
    }
    const token = authResult.token;
    return `${clientBase}/auth/callback?token=${token}`;
  }
}
