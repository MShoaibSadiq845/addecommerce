var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Injectable, UnauthorizedException, ConflictException, ForbiddenException, NotFoundException, Inject, } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../users/schemas/user.schema';
let AuthService = class AuthService {
    userModel;
    jwtService;
    constructor(userModel, jwtService) {
        this.userModel = userModel;
        this.jwtService = jwtService;
    }
    // ── Login ───────────────────────────────────────────────────────────────
    async login(dto) {
        const user = await this.userModel
            .findOne({ email: dto.email.toLowerCase().trim() })
            .exec();
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }
        const passwordMatches = await bcrypt.compare(dto.password, user.password);
        if (!passwordMatches) {
            throw new UnauthorizedException('Invalid email or password');
        }
        return this.buildAuthResponse(user);
    }
    // ── Register ─────────────────────────────────────────────────────────────
    /**
     * registeredBy is the currently-authenticated user (undefined for public calls).
     * Admin / Super Admin roles can only be assigned by a Super Admin.
     * All other callers get the 'User' role regardless of what they send.
     */
    async register(dto, registeredBy) {
        // Duplicate email check
        const exists = await this.userModel
            .findOne({ email: dto.email.toLowerCase().trim() })
            .exec();
        if (exists) {
            throw new ConflictException('An account with this email already exists');
        }
        // Role elevation guard — only Super Admins may create Admin accounts
        let assignedRole = UserRole.USER;
        if (dto.role && dto.role !== UserRole.USER) {
            if (!registeredBy || registeredBy.role !== UserRole.SUPER_ADMIN) {
                throw new ForbiddenException('Only a Super Admin may create Admin accounts');
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
        });
        return this.buildAuthResponse(user);
    }
    // ── getMe ────────────────────────────────────────────────────────────────
    async getMe(userId) {
        const user = await this.userModel
            .findById(userId)
            .select('-password')
            .exec();
        if (!user)
            throw new NotFoundException('User not found');
        return this.serializeUser(user);
    }
    // ── Helpers ───────────────────────────────────────────────────────────────
    buildAuthResponse(user) {
        const payload = { sub: user._id.toString(), email: user.email };
        const token = this.jwtService.sign(payload);
        return { token, user: this.serializeUser(user) };
    }
    serializeUser(user) {
        return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            loyaltyPoints: user.loyaltyPoints,
            avatar: user.avatar,
        };
    }
};
AuthService = __decorate([
    Injectable(),
    __param(0, InjectModel(User.name)),
    __param(1, Inject(JwtService)),
    __metadata("design:paramtypes", [Model,
        JwtService])
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map