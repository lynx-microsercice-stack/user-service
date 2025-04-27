import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { ApiClientService } from 'src/shared/services/api-client.service';
// Define interface for JWT payload
interface JwtPayload {
  sub: string;
  preferred_username: string;
  realm_access?: {
    roles: string[];
  };
  [key: string]: any; // Allow other properties
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);
  constructor(private readonly apiClientService: ApiClientService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization as string;

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header provided');
    }

    const [type, token] = authHeader.split(' ') as [string, string];

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid token format');
    }

    try {
      // Validate token with auth service
      await this.apiClientService.auth.validate(token);
      // Extract user information from token
      const decoded = jwt.decode(token) as JwtPayload;
      if (!decoded) {
        throw new UnauthorizedException('Invalid token');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (request as any).user = {
        username: decoded.preferred_username,
        realm_access: decoded.realm_access || { roles: [] },
      };

      return true;
    } catch (error) {
      this.logger.error('Token validation failed', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
