var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
/**
 * A JWT guard that NEVER rejects the request.
 * If no token is present (or the token is invalid) it sets request.user = null
 * and lets the request continue. Full JWT validation still happens on
 * every protected route that uses AuthGuard('jwt').
 */
let JwtOptionalGuard = class JwtOptionalGuard extends AuthGuard('jwt-optional') {
    // Override canActivate so we never throw even when Passport calls handleRequest with an error
    async canActivate(context) {
        try {
            // Attempt normal JWT validation — populates request.user on success
            await super.canActivate(context);
        }
        catch {
            // Swallow the error — unauthenticated callers are allowed through
        }
        return true;
    }
    // Override handleRequest so Passport doesn't throw on missing/invalid tokens
    handleRequest(_err, user) {
        // Return the user if found, null otherwise — never throw
        return user ?? null;
    }
};
JwtOptionalGuard = __decorate([
    Injectable()
], JwtOptionalGuard);
export { JwtOptionalGuard };
//# sourceMappingURL=jwt-optional.guard.js.map