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
var _a, _b, _c, _d;
import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus, Inject, } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GetUser } from './get-user.decorator';
import { JwtOptionalGuard } from './jwt-optional.guard';
import { UserDocument } from '../users/schemas/user.schema';
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    /**
     * POST /api/auth/login
     * Fully public — no guard.
     */
    async login(dto) {
        return this.authService.login(dto);
    }
    /**
     * POST /api/auth/register
     * Fully public — new accounts default to role 'User'.
     * JwtOptionalGuard never rejects: if a valid Super Admin token is present
     * it populates request.user so the service can allow role elevation;
     * if no token is present the request still goes through with user = null.
     */
    async register(dto, currentUser) {
        return this.authService.register(dto, currentUser);
    }
    /**
     * GET /api/auth/me
     * JWT-protected — returns the currently authenticated user's profile.
     */
    async getMe(userId) {
        return this.authService.getMe(userId);
    }
};
__decorate([
    Post('login'),
    HttpCode(HttpStatus.OK),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof LoginDto !== "undefined" && LoginDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    Post('register'),
    HttpCode(HttpStatus.CREATED),
    UseGuards(JwtOptionalGuard),
    __param(0, Body()),
    __param(1, GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof RegisterDto !== "undefined" && RegisterDto) === "function" ? _c : Object, typeof (_d = typeof UserDocument !== "undefined" && UserDocument) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    Get('me'),
    UseGuards(AuthGuard('jwt')),
    __param(0, GetUser('_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getMe", null);
AuthController = __decorate([
    Controller('auth'),
    __param(0, Inject(AuthService)),
    __metadata("design:paramtypes", [typeof (_a = typeof AuthService !== "undefined" && AuthService) === "function" ? _a : Object])
], AuthController);
export { AuthController };
//# sourceMappingURL=auth.controller.js.map