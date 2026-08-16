import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';

interface JwtPayload {
  sub: string;
  email: string;
}

/**
 * Same as the default JWT strategy but NEVER throws — instead it sets
 * request.user to null when the token is absent or invalid.
 * Used on endpoints that are public but can optionally use the identity
 * of an authenticated caller (e.g. role-elevated registration).
 */
@Injectable()
export class JwtOptionalStrategy extends PassportStrategy(
  Strategy,
  'jwt-optional',
) {
  constructor(
    @Inject(ConfigService) config: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET')!,
      // passport-jwt will call validate() only when a token is present
      passReqToCallback: false,
    });
  }

  async validate(payload: JwtPayload): Promise<UserDocument | null> {
    try {
      const user = await this.userModel
        .findById(payload.sub)
        .select('-password')
        .exec();
      return user ?? null;
    } catch {
      return null;
    }
  }
}
