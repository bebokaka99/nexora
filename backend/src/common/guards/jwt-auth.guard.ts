import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Thiếu Bearer Token trong tiêu đề Authorization');
    }

    try {
      const secret = this.configService.get<string>(
        'JWT_SECRET',
        'nexora_super_secret_jwt_key_2026_modular_monolith',
      );
      const payload = await this.jwtService.verifyAsync(token, { secret });

      // Gắn thông tin người dùng và ngữ cảnh doanh nghiệp vào request
      (request as any).user = {
        id: payload.sub,
        email: payload.email,
        fullName: payload.fullName,
        tenantId: payload.tenantId,
        role: payload.role || 'ADMIN',
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
