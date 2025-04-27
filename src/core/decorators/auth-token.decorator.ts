import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ApiClientService } from 'src/shared/services/api-client.service';
import { Request } from 'express';

export const AuthToken = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    const authHeader = request.headers.authorization as string;

    if (!authHeader) {
      return null;
    }

    // Extract token from "Bearer <token>"
    const [type, token] = authHeader.split(' ') as [string, string];
    if (type !== 'Bearer') {
      return null;
    }

    // Get CallableService from request
    const apiClientService = request.app.get(
      ApiClientService.name,
    ) as ApiClientService;

    try {
      // Validate token with auth service
      await apiClientService.auth.validate(token);
      return token;
    } catch (error: unknown) {
      console.error(error);
      return null;
    }
  },
);
