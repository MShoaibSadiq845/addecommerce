import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
declare const GithubStrategy_base: new (...args: [options: import("passport-github2").StrategyOptions] | [options: import("passport-github2").StrategyOptionsWithRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class GithubStrategy extends GithubStrategy_base {
    constructor(config: ConfigService);
    validate(accessToken: string, refreshToken: string, profile: any, done: (err: any, user?: any) => void): Promise<any>;
}
export {};
