import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtOptionalStrategy } from './jwt-optional.strategy';
import { JwtOptionalGuard } from './jwt-optional.guard';
import { RolesGuard } from './roles.guard';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const expiresIn = config.get<string>('JWT_EXPIRES_IN') || '7d';
        return {
          secret: config.get<string>('JWT_SECRET'),
          signOptions: { expiresIn: expiresIn as any },
        };
      },
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtOptionalStrategy, JwtOptionalGuard, RolesGuard],
  exports: [PassportModule, JwtModule, AuthService, JwtOptionalGuard, RolesGuard],
})
export class AuthModule {}
