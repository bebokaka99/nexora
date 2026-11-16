import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Public, Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
@UseGuards(AuthGuard, RolesGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập người dùng bằng Email & Mật khẩu' })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công, trả về Access Token và Refresh Token' })
  @ApiResponse({ status: 401, description: 'Sai tài khoản hoặc mật khẩu' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Làm mới Access Token bằng Refresh Token' })
  @ApiResponse({ status: 200, description: 'Cấp Access Token mới thành công' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy thông tin tài khoản hiện tại từ Access Token' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin payload của user' })
  async getProfile(@CurrentUser() user: any) {
    return this.authService.getProfile(user);
  }

  @Get('admin-only')
  @Roles('TENANT_ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Endpoint thử nghiệm phân quyền (Chỉ dành cho TENANT_ADMIN)' })
  @ApiResponse({ status: 200, description: 'Quyền hợp lệ' })
  @ApiResponse({ status: 403, description: 'Không đủ quyền' })
  async testAdminOnly(@CurrentUser() user: any) {
    return {
      message: 'Chúc mừng! Bạn đang truy cập với quyền TENANT_ADMIN.',
      user,
    };
  }
}
