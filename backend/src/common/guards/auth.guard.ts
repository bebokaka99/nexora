import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from '../decorators/roles.decorator';
import { JwtHelper } from '../utils/jwt.helper';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Thiếu hoặc sai định dạng Authorization Bearer Token');
    }

    const token = authHeader.split(' ')[1];
    const secret =
      this.configService.get<string>('JWT_SECRET') ||
      'nexora_super_secret_jwt_key_2026_modular_monolith';

    try {
      const payload = JwtHelper.verify(token, secret);
      request.user = payload;
      return true;
    } catch (err) {
      throw new UnauthorizedException(`Token không hợp lệ hoặc đã hết hạn: ${err.message}`);
    }
  }
}
