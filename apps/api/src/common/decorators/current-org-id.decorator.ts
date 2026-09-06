import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CurrentOrgId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers["x-organization-id"] || request.params.orgId || null;
  },
);
