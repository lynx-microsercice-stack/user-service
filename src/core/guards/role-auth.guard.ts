import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from '../decorators/role.decorator';

@Injectable()
export class RoleAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const user = (request as any).user;
    // If user is not defined, authentication failed
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }
    const roles = user.realm_access?.roles || [];
    return requiredRoles.some((role) => roles.includes(role));
  }
}
