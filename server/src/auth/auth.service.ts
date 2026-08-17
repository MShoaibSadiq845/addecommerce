import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface SocialUserDto {
  email: string;
  name: string;
  avatar: string;
  provider: 'google' | 'github' | 'discord';
  providerId: string;
}

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
    phone?: string;
    address?: string;
    provider?: string;
    providerId?: string;
    lastLogin?: Date;
    linkedProviders?: Array<{ provider: string; providerId: string }>;
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(JwtService) private jwtService: JwtService,
  ) {}

  // ── Login ───────────────────────────────────────────────────────────────
  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.userModel
      .findOne({ email: dto.email.toLowerCase().trim() })
      .exec();

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.password) {
      throw new UnauthorizedException(
        `This account was created using ${user.provider || 'social'} login. Please sign in with ${user.provider || 'social login'}.`,
      );
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    user.lastLogin = new Date();
    await user.save();

    return this.buildAuthResponse(user);
  }

  // ── Register ─────────────────────────────────────────────────────────────
  /**
   * registeredBy is the currently-authenticated user (undefined for public calls).
   * Admin / Super Admin roles can only be assigned by a Super Admin.
   * All other callers get the 'User' role regardless of what they send.
   */
  async register(
    dto: RegisterDto,
    registeredBy?: UserDocument,
  ): Promise<AuthResponse> {
    // Duplicate email check
    const exists = await this.userModel
      .findOne({ email: dto.email.toLowerCase().trim() })
      .exec();
    if (exists) {
      throw new ConflictException('An account with this email already exists');
    }

    // Role elevation guard — only Super Admins may create Admin accounts
    let assignedRole: UserRole = UserRole.USER;
    if (dto.role && dto.role !== UserRole.USER) {
      if (!registeredBy || registeredBy.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException(
          'Only a Super Admin may create Admin accounts',
        );
      }
      assignedRole = dto.role;
    }

    const hashed = await bcrypt.hash(dto.password, 12);

    const user = await this.userModel.create({
      name: dto.name.trim(),
      email: dto.email.toLowerCase().trim(),
      password: hashed,
      role: assignedRole,
      avatar: dto.avatar ?? '',
      provider: 'local',
      providerId: '',
      lastLogin: new Date(),
      linkedProviders: [{ provider: 'local', providerId: dto.email.toLowerCase().trim() }],
    });

    return this.buildAuthResponse(user);
  }

  // ── Validate Social User (OAuth) ──────────────────────────────────────────
  async validateSocialUser(socialUser: SocialUserDto): Promise<AuthResponse> {
    const { email, name, avatar, provider, providerId } = socialUser;
    const cleanEmail = email ? email.toLowerCase().trim() : '';

    let user: UserDocument | null = null;

    if (cleanEmail) {
      user = await this.userModel.findOne({ email: cleanEmail }).exec();
    }

    if (!user && providerId) {
      user = await this.userModel
        .findOne({
          $or: [
            { provider, providerId },
            { 'linkedProviders.provider': provider, 'linkedProviders.providerId': providerId },
          ],
        })
        .exec();
    }

    if (user) {
      // User exists. Link this provider if not already present
      if (!user.linkedProviders) {
        user.linkedProviders = [];
      }
      const alreadyLinked = user.linkedProviders.some(
        (p) => p.provider === provider && p.providerId === providerId,
      );
      if (!alreadyLinked) {
        user.linkedProviders.push({ provider, providerId });
      }

      // Update avatar if empty
      if (!user.avatar && avatar) {
        user.avatar = avatar;
      }

      user.lastLogin = new Date();
      await user.save();
    } else {
      // Create new user
      user = await this.userModel.create({
        name: name || (cleanEmail ? cleanEmail.split('@')[0] : `${provider} User`),
        email: cleanEmail || `${provider}_${providerId}@social.com`,
        password: '',
        avatar: avatar || '',
        provider,
        providerId,
        role: UserRole.USER,
        lastLogin: new Date(),
        linkedProviders: [{ provider, providerId }],
      });
    }

    return this.buildAuthResponse(user);
  }

  // ── getMe ────────────────────────────────────────────────────────────────
  async getMe(userId: string): Promise<AuthResponse['user']> {
    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return this.serializeUser(user);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  public buildAuthResponse(user: UserDocument): AuthResponse {
    const payload = { sub: user._id.toString(), email: user.email };
    const token = this.jwtService.sign(payload);
    return { token, user: this.serializeUser(user) };
  }

  public serializeUser(user: UserDocument): AuthResponse['user'] {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      loyaltyPoints: user.loyaltyPoints,
      avatar: user.avatar,
      phone: user.phone || '',
      address: user.address || '',
      provider: user.provider || 'local',
      providerId: user.providerId || '',
      lastLogin: user.lastLogin,
      linkedProviders: user.linkedProviders || [],
    };
  }
}
