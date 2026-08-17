"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GithubStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_github2_1 = require("passport-github2");
const config_1 = require("@nestjs/config");
let GithubStrategy = class GithubStrategy extends (0, passport_1.PassportStrategy)(passport_github2_1.Strategy, 'github') {
    constructor(config) {
        const clientID = config.get('GITHUB_Client_ID') ||
            config.get('GITHUB_CLIENT_ID') ||
            '';
        const clientSecret = config.get('GITHUB_Client_SECRET') ||
            config.get('GITHUB_CLIENT_SECRET') ||
            '';
        const callbackURL = config.get('GITHUB_CALLBACK_URL') ||
            'http://localhost:5000/api/auth/github/callback';
        super({
            clientID,
            clientSecret,
            callbackURL,
            scope: ['user:email'],
        });
    }
    async validate(accessToken, refreshToken, profile, done) {
        const { id, displayName, username, emails, photos, _json } = profile;
        const email = emails?.[0]?.value || _json?.email || `${username}@github.com`;
        const user = {
            provider: 'github',
            providerId: id,
            email: email,
            name: displayName || username || 'GitHub User',
            avatar: photos?.[0]?.value || _json?.avatar_url || '',
        };
        done(null, user);
    }
};
exports.GithubStrategy = GithubStrategy;
exports.GithubStrategy = GithubStrategy = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(config_1.ConfigService)),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GithubStrategy);
//# sourceMappingURL=github.strategy.js.map