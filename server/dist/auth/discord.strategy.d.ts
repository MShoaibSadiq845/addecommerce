import { ConfigService } from '@nestjs/config';
declare const DiscordStrategy_base: new (...args: [options: import("passport-oauth2").StrategyOptions] | [options: import("passport-oauth2").StrategyOptionsWithRequest]) => import("passport-oauth2") & {
    validate(...args: any[]): unknown;
};
export declare class DiscordStrategy extends DiscordStrategy_base {
    constructor(config: ConfigService);
    validate(accessToken: string, refreshToken: string, profile: any, done: (err: any, user?: any) => void): Promise<any>;
}
export {};
