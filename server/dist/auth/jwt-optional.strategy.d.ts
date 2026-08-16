import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { UserDocument } from '../users/schemas/user.schema';
interface JwtPayload {
    sub: string;
    email: string;
}
declare const JwtOptionalStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtOptionalStrategy extends JwtOptionalStrategy_base {
    private userModel;
    constructor(config: ConfigService, userModel: Model<UserDocument>);
    validate(payload: JwtPayload): Promise<UserDocument | null>;
}
export {};
