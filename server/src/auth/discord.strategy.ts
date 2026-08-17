import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-discord';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor(@Inject(ConfigService) config: ConfigService) {
    const clientID =
      config.get<string>('DISCARD_Client_ID') ||
      config.get<string>('DISCORD_CLIENT_ID') ||
      '';
    const clientSecret =
      config.get<string>('DISCARD_Client_SECRET') ||
      config.get<string>('DISCORD_CLIENT_SECRET') ||
      '';
    const callbackURL =
      config.get<string>('DISCORD_CALLBACK_URL') ||
      'http://localhost:5000/api/auth/discord/callback';

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['identify', 'email'],
    } as any);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (err: any, user?: any) => void,
  ): Promise<any> {
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
}
