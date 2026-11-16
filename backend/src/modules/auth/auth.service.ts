import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { JwtHelper } from '../../common/utils/jwt.helper';

/**
 * AuthService — TASK-009: đọc user trực tiếp từ PostgreSQL qua Prisma.
 * Tài khoản demo hardcode (mockUsers) đã bị xóa. Không còn fallback
 * in-memory: nếu DB chưa migrate / chưa seed, đăng nhập trả 401;
 * nếu DB không kết nối được, Prisma ném lỗi và request fail rõ ràng
 * thay vì lặng lẽ đăng nhập bằng tài khoản giả.
 * Tài khoản admin seed: xem database/prisma/seed.ts (admin@nexora.vn,
 * mật khẩu từ biến môi trường SEED_ADMIN_PASSWORD).
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    this.logger.log(`Attempting login for email: ${email}`);

    // 1. Tìm user trong PostgreSQL (không try/catch nuốt lỗi DB).
    const dbUser = await this.prisma.user.findFirst({
      where: { email },
      include: {
        tenant: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!dbUser) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    // 2. Đối chiếu mật khẩu (hash PBKDF2, xem JwtHelper.hashPassword).
    const isMatch = JwtHelper.comparePassword(password, dbUser.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const user = {
      id: dbUser.id,
      tenantId: dbUser.tenantId,
      email: dbUser.email,
      fullName: dbUser.fullName,
      roles: dbUser.roles?.map((r: any) => r.role?.code) || ['STAFF'],
      storeId: dbUser.storeId,
      tenant: dbUser.tenant,
    };

    // 3. Sinh JWT Access Token & Refresh Token
    const jwtSecret =
      this.configService.get<string>('JWT_SECRET') ||
      'nexora_super_secret_jwt_key_2026_modular_monolith';
    const jwtRefreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      'nexora_super_secret_refresh_jwt_key_2026';

    const tokenPayload = {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      tenantId: user.tenantId,
      roles: user.roles,
      storeId: user.storeId,
    };

    const accessToken = JwtHelper.sign(tokenPayload, jwtSecret, 15 * 60); // 15 mins
    const refreshToken = JwtHelper.sign(
      { sub: user.id, tenantId: user.tenantId },
      jwtRefreshSecret,
      7 * 24 * 3600, // 7 days
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roles: user.roles,
        tenant: user.tenant,
      },
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    const jwtSecret =
      this.configService.get<string>('JWT_SECRET') ||
      'nexora_super_secret_jwt_key_2026_modular_monolith';
    const jwtRefreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      'nexora_super_secret_refresh_jwt_key_2026';

    try {
      const payload = JwtHelper.verify(dto.refreshToken, jwtRefreshSecret);
      const newAccessToken = JwtHelper.sign(
        { sub: payload.sub, tenantId: payload.tenantId },
        jwtSecret,
        15 * 60,
      );

      return {
        accessToken: newAccessToken,
        expiresIn: 15 * 60,
      };
    } catch (err) {
      throw new UnauthorizedException(`Refresh Token không hợp lệ: ${err.message}`);
    }
  }

  async getProfile(userPayload: any) {
    return {
      user: userPayload,
      message: 'Thông tin hồ sơ xác thực hợp lệ',
    };
  }
}
