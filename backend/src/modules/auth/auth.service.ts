import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

interface InMemoryTenant {
  id: string;
  name: string;
  slug: string;
  status: 'TRIAL' | 'ACTIVE' | 'SUSPENDED';
  trialEndsAt: Date;
  planCode: string;
}

interface InMemoryUser {
  id: string;
  tenantId: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phoneNumber?: string;
  status: 'ACTIVE' | 'INACTIVE';
  role: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // In-memory fallback store seeded for local dev and testing
  private inMemoryTenants: InMemoryTenant[] = [
    {
      id: 'tenant-001-gia-dung-hien-dai',
      name: 'Gia Dụng Hiện Đại',
      slug: 'gia-dung-hien-dai',
      status: 'ACTIVE',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      planCode: 'GROWTH',
    },
  ];

  private inMemoryUsers: InMemoryUser[] = [];

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.seedInMemoryUsers();
  }

  private async seedInMemoryUsers() {
    // Hash default admin password "Nexora@2026"
    const defaultHash = await bcrypt.hash('Nexora@2026', 10);
    this.inMemoryUsers.push({
      id: 'user-001-admin',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      email: 'admin@nexora.vn',
      passwordHash: defaultHash,
      fullName: 'Nguyễn Văn Quản Trị',
      phoneNumber: '0988777666',
      status: 'ACTIVE',
      role: 'ADMIN',
    });
    this.logger.log('Đã nạp tài khoản mẫu [admin@nexora.vn] vào bộ nhớ.');
  }

  /**
   * Đăng ký tài khoản Tenant mới kèm tài khoản quản trị viên
   */
  async register(dto: RegisterDto) {
    const isPrismaReady = await this.checkPrismaReady();

    if (isPrismaReady) {
      // 1. Kiểm tra slug đã tồn tại
      const existingTenant = await this.prisma.tenant.findUnique({
        where: { slug: dto.slug },
      });
      if (existingTenant) {
        throw new ConflictException(`Mã doanh nghiệp '${dto.slug}' đã được sử dụng`);
      }

      // 2. Băm mật khẩu
      const passwordHash = await bcrypt.hash(dto.password, 10);

      // 3. Tạo Tenant và User trong transaction
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 14);

      const result = await this.prisma.$transaction(async (tx) => {
        const tenant = await tx.tenant.create({
          data: {
            name: dto.companyName,
            slug: dto.slug,
            status: 'TRIAL',
            trialEndsAt,
          },
        });

        const user = await tx.user.create({
          data: {
            tenantId: tenant.id,
            email: dto.email.toLowerCase(),
            passwordHash,
            fullName: dto.fullName,
            phoneNumber: dto.phoneNumber,
            status: 'ACTIVE',
          },
        });

        return { tenant, user };
      });

      return this.generateTokenResponse(result.user, result.tenant);
    } else {
      // Fallback In-memory
      const existingSlug = this.inMemoryTenants.find((t) => t.slug === dto.slug);
      if (existingSlug) {
        throw new ConflictException(`Mã doanh nghiệp '${dto.slug}' đã được sử dụng`);
      }

      const existingUser = this.inMemoryUsers.find(
        (u) => u.email.toLowerCase() === dto.email.toLowerCase(),
      );
      if (existingUser) {
        throw new ConflictException(`Email '${dto.email}' đã được đăng ký`);
      }

      const passwordHash = await bcrypt.hash(dto.password, 10);
      const newTenantId = `tenant-${Date.now()}`;
      const newUserId = `user-${Date.now()}`;
      const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

      const newTenant: InMemoryTenant = {
        id: newTenantId,
        name: dto.companyName,
        slug: dto.slug,
        status: 'TRIAL',
        trialEndsAt,
        planCode: 'BASIC',
      };

      const newUser: InMemoryUser = {
        id: newUserId,
        tenantId: newTenantId,
        email: dto.email.toLowerCase(),
        passwordHash,
        fullName: dto.fullName,
        phoneNumber: dto.phoneNumber,
        status: 'ACTIVE',
        role: 'ADMIN',
      };

      this.inMemoryTenants.push(newTenant);
      this.inMemoryUsers.push(newUser);

      return this.generateTokenResponse(newUser, newTenant);
    }
  }

  /**
   * Đăng nhập xác thực tài khoản
   */
  async login(dto: LoginDto) {
    const isPrismaReady = await this.checkPrismaReady();

    if (isPrismaReady) {
      const user = await this.prisma.user.findFirst({
        where: { email: dto.email.toLowerCase() },
        include: { tenant: true },
      });

      if (!user) {
        throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
      }

      const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
      }

      if (user.status !== 'ACTIVE') {
        throw new UnauthorizedException('Tài khoản của bạn đã bị khóa hoặc chưa kích hoạt');
      }

      if (user.tenant && user.tenant.status === 'TERMINATED') {
        throw new UnauthorizedException('Doanh nghiệp của bạn đã bị đóng băng tài khoản');
      }

      return this.generateTokenResponse(user, user.tenant);
    } else {
      // In-memory fallback
      const user = this.inMemoryUsers.find(
        (u) => u.email.toLowerCase() === dto.email.toLowerCase(),
      );

      if (!user) {
        throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
      }

      const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
      }

      const tenant = this.inMemoryTenants.find((t) => t.id === user.tenantId);
      return this.generateTokenResponse(user, tenant);
    }
  }

  /**
   * Làm mới Access Token từ Refresh Token
   */
  async refresh(dto: RefreshTokenDto) {
    try {
      const refreshSecret = this.configService.get<string>(
        'JWT_REFRESH_SECRET',
        'nexora_super_secret_refresh_jwt_key_2026',
      );
      const payload = await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: refreshSecret,
      });

      const newAccessToken = await this.jwtService.signAsync(
        {
          sub: payload.sub,
          email: payload.email,
          fullName: payload.fullName,
          tenantId: payload.tenantId,
          role: payload.role,
        },
        {
          secret: this.configService.get<string>(
            'JWT_SECRET',
            'nexora_super_secret_jwt_key_2026_modular_monolith',
          ),
          expiresIn: '15m',
        },
      );

      return {
        accessToken: newAccessToken,
        expiresIn: 900,
        tokenType: 'Bearer',
      };
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }
  }

  /**
   * Lấy thông tin tài khoản hiện tại từ User ID
   */
  async getMe(userId: string) {
    const isPrismaReady = await this.checkPrismaReady();

    if (isPrismaReady) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { tenant: true },
      });

      if (!user) {
        throw new UnauthorizedException('Không tìm thấy tài khoản người dùng');
      }

      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        status: user.status,
        role: 'ADMIN',
        tenant: user.tenant
          ? {
              id: user.tenant.id,
              name: user.tenant.name,
              slug: user.tenant.slug,
              status: user.tenant.status,
              trialEndsAt: user.tenant.trialEndsAt,
            }
          : null,
      };
    } else {
      const user = this.inMemoryUsers.find((u) => u.id === userId);
      if (!user) {
        throw new UnauthorizedException('Không tìm thấy tài khoản người dùng');
      }

      const tenant = this.inMemoryTenants.find((t) => t.id === user.tenantId);
      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        status: user.status,
        role: user.role,
        tenant: tenant
          ? {
              id: tenant.id,
              name: tenant.name,
              slug: tenant.slug,
              status: tenant.status,
              trialEndsAt: tenant.trialEndsAt,
            }
          : null,
      };
    }
  }

  /**
   * Tạo Access Token (15m) và Refresh Token (7d)
   */
  private async generateTokenResponse(user: any, tenant: any) {
    const secret = this.configService.get<string>(
      'JWT_SECRET',
      'nexora_super_secret_jwt_key_2026_modular_monolith',
    );
    const refreshSecret = this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'nexora_super_secret_refresh_jwt_key_2026',
    );

    const payload = {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      tenantId: tenant?.id || user.tenantId,
      role: user.role || 'ADMIN',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
      tokenType: 'Bearer',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role || 'ADMIN',
      },
      tenant: tenant
        ? {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            status: tenant.status,
          }
        : null,
    };
  }

  private async checkPrismaReady(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
