"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = __importStar(require("bcryptjs"));
const user_schema_1 = require("../users/schemas/user.schema");
let AuthService = class AuthService {
    constructor(userModel, jwtService) {
        this.userModel = userModel;
        this.jwtService = jwtService;
    }
    async login(dto) {
        const user = await this.userModel
            .findOne({ email: dto.email.toLowerCase().trim() })
            .exec();
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (!user.password) {
            throw new common_1.UnauthorizedException(`This account was created using ${user.provider || 'social'} login. Please sign in with ${user.provider || 'social login'}.`);
        }
        const passwordMatches = await bcrypt.compare(dto.password, user.password);
        if (!passwordMatches) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        user.lastLogin = new Date();
        await user.save();
        return this.buildAuthResponse(user);
    }
    async register(dto, registeredBy) {
        const exists = await this.userModel
            .findOne({ email: dto.email.toLowerCase().trim() })
            .exec();
        if (exists) {
            throw new common_1.ConflictException('An account with this email already exists');
        }
        let assignedRole = user_schema_1.UserRole.USER;
        if (dto.role && dto.role !== user_schema_1.UserRole.USER) {
            if (!registeredBy || registeredBy.role !== user_schema_1.UserRole.SUPER_ADMIN) {
                throw new common_1.ForbiddenException('Only a Super Admin may create Admin accounts');
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
    async validateSocialUser(socialUser) {
        const { email, name, avatar, provider, providerId } = socialUser;
        const cleanEmail = email ? email.toLowerCase().trim() : '';
        let user = null;
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
            if (!user.linkedProviders) {
                user.linkedProviders = [];
            }
            const alreadyLinked = user.linkedProviders.some((p) => p.provider === provider && p.providerId === providerId);
            if (!alreadyLinked) {
                user.linkedProviders.push({ provider, providerId });
            }
            if (!user.avatar && avatar) {
                user.avatar = avatar;
            }
            user.lastLogin = new Date();
            await user.save();
        }
        else {
            user = await this.userModel.create({
                name: name || (cleanEmail ? cleanEmail.split('@')[0] : `${provider} User`),
                email: cleanEmail || `${provider}_${providerId}@social.com`,
                password: '',
                avatar: avatar || '',
                provider,
                providerId,
                role: user_schema_1.UserRole.USER,
                lastLogin: new Date(),
                linkedProviders: [{ provider, providerId }],
            });
        }
        return this.buildAuthResponse(user);
    }
    async getMe(userId) {
        const user = await this.userModel
            .findById(userId)
            .select('-password')
            .exec();
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return this.serializeUser(user);
    }
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
            phone: user.phone || '',
            address: user.address || '',
            provider: user.provider || 'local',
            providerId: user.providerId || '',
            lastLogin: user.lastLogin,
            linkedProviders: user.linkedProviders || [],
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, common_1.Inject)(jwt_1.JwtService)),
    __metadata("design:paramtypes", [mongoose_2.Model, jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map