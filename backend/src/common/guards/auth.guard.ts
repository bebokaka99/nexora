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
import { getJwtSecret } from '../utils/jwt-secrets';

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
    // TASK-011: fail-fast khi thiếu JWT_SECRET — không fallback secret hardcode.
    const secret = getJwtSecret(this.configService);

    try {
      const payload = JwtHelper.verify(token, secret);
      request.user = payload;
      return true;
    } catch (err) {
      throw new UnauthorizedException(`Token không hợp lệ hoặc đã hết hạn: ${err.message}`);
    }
  }
}
