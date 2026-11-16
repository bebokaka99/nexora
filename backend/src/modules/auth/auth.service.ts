import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { JwtHelper } from '../../common/utils/jwt.helper';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // Danh sách tài khoản demo cho môi trường dev/local nếu DB chưa migrate
  private readonly mockUsers = [
    {
      id: 'usr-admin-001',
      tenantId: 'tenant-demo-giadung',
      tenantSlug: 'gia-dung-hien-dai',
      tenantName: 'Gia Dụng Hiện Đại',
      email: 'admin@nexora.vn',
      passwordHash: JwtHelper.hashPassword('Nexora@2026'),
      fullName: 'Quản Trị Viên NEXORA',
      roles: ['TENANT_ADMIN', 'STORE_MANAGER'],
      storeId: 'store-01',
    },
    {
      id: 'usr-cashier-001',
      tenantId: 'tenant-demo-giadung',
      tenantSlug: 'gia-dung-hien-dai',
      tenantName: 'Gia Dụng Hiện Đại',
      email: 'cashier@nexora.vn',
      passwordHash: JwtHelper.hashPassword('Nexora@2026'),
      fullName: 'Thu Ngân Chi Nhánh 1',
      roles: ['CASHIER'],
      storeId: 'store-01',
    },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    this.logger.log(`Attempting login for email: ${email}`);

    let user: any = null;

    // 1. Thử tìm trong database nếu DB sẵn sàng
    try {
      user = await this.prisma.user.findFirst({
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
    } catch {
      this.logger.warn('DB query failed, falling back to mock authentication accounts.');
    }

    // 2. Fallback sang mock user nếu chưa có trong DB
    if (!user) {
      const mock = this.mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (mock && JwtHelper.comparePassword(password, mock.passwordHash)) {
        user = {
          id: mock.id,
          tenantId: mock.tenantId,
          email: mock.email,
          fullName: mock.fullName,
          roles: mock.roles,
          storeId: mock.storeId,
          tenant: {
            id: mock.tenantId,
            name: mock.tenantName,
            slug: mock.tenantSlug,
          },
        };
      }
    } else {
      // Validate password từ DB
      const isMatch = JwtHelper.comparePassword(password, user.passwordHash);
      if (!isMatch) {
        throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
      }
      user = {
        id: user.id,
        tenantId: user.tenantId,
        email: user.email,
        fullName: user.fullName,
        roles: user.roles?.map((r: any) => r.role?.code) || ['STAFF'],
        storeId: user.storeId,
        tenant: user.tenant,
      };
    }

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

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
