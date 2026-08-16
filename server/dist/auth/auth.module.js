var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
let AuthModule = class AuthModule {
};
AuthModule = __decorate([
    Module({
        imports: [
            PassportModule.register({ defaultStrategy: 'jwt' }),
            JwtModule.registerAsync({
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: (config) => {
                    const expiresIn = config.get('JWT_EXPIRES_IN') || '7d';
                    return {
                        secret: config.get('JWT_SECRET'),
                        signOptions: { expiresIn: expiresIn },
                    };
                },
            }),
            MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        ],
        controllers: [AuthController],
        providers: [AuthService, JwtStrategy, JwtOptionalStrategy, JwtOptionalGuard, RolesGuard],
        exports: [PassportModule, JwtModule, AuthService, JwtOptionalGuard, RolesGuard],
    })
], AuthModule);
export { AuthModule };
//# sourceMappingURL=auth.module.js.map