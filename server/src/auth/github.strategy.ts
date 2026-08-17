import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(@Inject(ConfigService) config: ConfigService) {
    const clientID =
      config.get<string>('GITHUB_Client_ID') ||
      config.get<string>('GITHUB_CLIENT_ID') ||
      '';
    const clientSecret =
      config.get<string>('GITHUB_Client_SECRET') ||
      config.get<string>('GITHUB_CLIENT_SECRET') ||
      '';
    const callbackURL =
      config.get<string>('GITHUB_CALLBACK_URL') ||
      'http://localhost:5000/api/auth/github/callback';

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (err: any, user?: any) => void,
  ): Promise<any> {
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
}
