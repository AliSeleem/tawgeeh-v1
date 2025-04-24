import {
  Injectable,
  CanActivate,
  ExecutionContext,
  mixin,
} from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const RoleGuard = (role: Role | Role[]) => {
  @Injectable()
  class RoleGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();
      const user = request.user; // Assumes user is attached by auth middleware

      if (!user || !user.role) {
        console.error('User or role not found in request', request.user);
        return false;
      }

      // If role is an array, check if user.role is included; otherwise, check if it matches
      return Array.isArray(role)
        ? role.includes(user.role)
        : user.role === role;
    }
  }

  return mixin(RoleGuardMixin);
};
