import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
interface JwtPayload {
    sub: string;
    email: string;
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private userModel;
    constructor(config: ConfigService, userModel: Model<UserDocument>);
    validate(payload: JwtPayload): Promise<import("mongoose").Document<unknown, {}, UserDocument, {}, import("mongoose").DefaultSchemaOptions> & User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
export {};
