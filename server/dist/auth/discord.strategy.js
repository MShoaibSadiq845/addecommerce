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
exports.DiscordStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_discord_1 = require("passport-discord");
const config_1 = require("@nestjs/config");
let DiscordStrategy = class DiscordStrategy extends (0, passport_1.PassportStrategy)(passport_discord_1.Strategy, 'discord') {
    constructor(config) {
        const clientID = config.get('DISCARD_Client_ID') ||
            config.get('DISCORD_CLIENT_ID') ||
            '';
        const clientSecret = config.get('DISCARD_Client_SECRET') ||
            config.get('DISCORD_CLIENT_SECRET') ||
            '';
        const callbackURL = config.get('DISCORD_CALLBACK_URL') ||
            'http://localhost:5000/api/auth/discord/callback';
        super({
            clientID,
            clientSecret,
            callbackURL,
            scope: ['identify', 'email'],
        });
    }
    async validate(accessToken, refreshToken, profile, done) {
        const { id, username, global_name, email, avatar } = profile;
        const avatarUrl = avatar
            ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`
            : '';
        const user = {
            provider: 'discord',
            providerId: id,
            email: email || `${username}@discord.com`,
            name: global_name || username || 'Discord User',
            avatar: avatarUrl,
        };
        done(null, user);
    }
};
exports.DiscordStrategy = DiscordStrategy;
exports.DiscordStrategy = DiscordStrategy = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(config_1.ConfigService)),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DiscordStrategy);
//# sourceMappingURL=discord.strategy.js.map