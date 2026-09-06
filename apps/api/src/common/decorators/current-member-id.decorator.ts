import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CurrentMemberId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.membership?.id || null;
  },
);
