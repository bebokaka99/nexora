import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const tenantId = request.user?.tenantId || request.headers['x-tenant-id'];

    if (!tenantId) {
      throw new UnauthorizedException('Không tìm thấy ngữ cảnh doanh nghiệp (tenantId) trong yêu cầu');
    }

    return tenantId;
  },
);
