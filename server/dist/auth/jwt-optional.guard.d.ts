import { ExecutionContext } from '@nestjs/common';
declare const JwtOptionalGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
/**
 * A JWT guard that NEVER rejects the request.
 * If no token is present (or the token is invalid) it sets request.user = null
 * and lets the request continue. Full JWT validation still happens on
 * every protected route that uses AuthGuard('jwt').
 */
export declare class JwtOptionalGuard extends JwtOptionalGuard_base {
    canActivate(context: ExecutionContext): Promise<boolean>;
    handleRequest<T>(_err: any, user: T): T;
}
export {};
