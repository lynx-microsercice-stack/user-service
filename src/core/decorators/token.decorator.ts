import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
export const Token = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
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

    return token;
  },
);
