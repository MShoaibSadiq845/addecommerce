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
import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
/**
 * Same as the default JWT strategy but NEVER throws — instead it sets
 * request.user to null when the token is absent or invalid.
 * Used on endpoints that are public but can optionally use the identity
 * of an authenticated caller (e.g. role-elevated registration).
 */
let JwtOptionalStrategy = class JwtOptionalStrategy extends PassportStrategy(Strategy, 'jwt-optional') {
    userModel;
    constructor(config, userModel) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.get('JWT_SECRET'),
            // passport-jwt will call validate() only when a token is present
            passReqToCallback: false,
        });
        this.userModel = userModel;
    }
    async validate(payload) {
        try {
            const user = await this.userModel
                .findById(payload.sub)
                .select('-password')
                .exec();
            return user ?? null;
        }
        catch {
            return null;
        }
    }
};
JwtOptionalStrategy = __decorate([
    Injectable(),
    __param(0, Inject(ConfigService)),
    __param(1, InjectModel(User.name)),
    __metadata("design:paramtypes", [ConfigService,
        Model])
], JwtOptionalStrategy);
export { JwtOptionalStrategy };
//# sourceMappingURL=jwt-optional.strategy.js.map