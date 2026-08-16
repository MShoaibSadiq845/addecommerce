import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * A JWT guard that NEVER rejects the request.
 * If no token is present (or the token is invalid) it sets request.user = null
 * and lets the request continue. Full JWT validation still happens on
 * every protected route that uses AuthGuard('jwt').
 */
@Injectable()
export class JwtOptionalGuard extends AuthGuard('jwt-optional') {
  // Override canActivate so we never throw even when Passport calls handleRequest with an error
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // Attempt normal JWT validation — populates request.user on success
      await super.canActivate(context);
    } catch {
      // Swallow the error — unauthenticated callers are allowed through
    }
    return true;
  }

  // Override handleRequest so Passport doesn't throw on missing/invalid tokens
  handleRequest<T>(_err: any, user: T): T {
    // Return the user if found, null otherwise — never throw
    return user ?? (null as any);
  }
}
