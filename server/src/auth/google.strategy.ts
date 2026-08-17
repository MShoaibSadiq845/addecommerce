import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(@Inject(ConfigService) config: ConfigService) {
    const clientID =
      config.get<string>('Google_Client_ID') ||
      config.get<string>('GOOGLE_CLIENT_ID') ||
      '';
    const clientSecret =
      config.get<string>('Google_Client_SECRET') ||
      config.get<string>('GOOGLE_CLIENT_SECRET') ||
      '';
    const callbackURL =
      config.get<string>('GOOGLE_CALLBACK_URL') ||
      'http://localhost:5000/api/auth/google/callback';

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, displayName, emails, photos } = profile;
    const user = {
      provider: 'google',
      providerId: id,
      email: emails?.[0]?.value || '',
      name:
        displayName ||
        `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim() ||
        'Google User',
      avatar: photos?.[0]?.value || '',
    };
    done(null, user);
  }
}
