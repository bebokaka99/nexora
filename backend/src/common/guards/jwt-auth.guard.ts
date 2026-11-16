import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { JwtHelper } from '../utils/jwt.helper';
import { getJwtSecret } from '../utils/jwt-secrets';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Thiếu Bearer Token trong tiêu đề Authorization');
    }

    try {
      // TASK-011: fail-fast khi thiếu JWT_SECRET — không fallback secret hardcode.
      const secret = getJwtSecret(this.configService);
      const payload = JwtHelper.verify(token, secret);

      // Gắn thông tin người dùng và ngữ cảnh doanh nghiệp vào request
      (request as any).user = {
        id: payload.sub,
        email: payload.email,
        fullName: payload.fullName,
        tenantId: payload.tenantId,
        role: payload.role || payload.roles?.[0] || 'ADMIN',
        roles: payload.roles || [payload.role || 'ADMIN'],
      };
      (request as any).tenantId = payload.tenantId;

      return true;
    } catch {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
