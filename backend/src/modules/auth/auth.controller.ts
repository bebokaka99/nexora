import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Đăng ký tài khoản Tenant mới',
    description: 'Tạo doanh nghiệp bán lẻ mới trên NEXORA kèm tài khoản Super/Tenant Admin và cấp 14 ngày dùng thử miễn phí.',
  })
  @ApiResponse({
    status: 201,
    description: 'Đăng ký thành công, trả về Access Token và Refresh Token.',
  })
  @ApiResponse({
    status: 409,
    description: 'Mã slug doanh nghiệp hoặc email đã được sử dụng.',
  })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đăng nhập vào hệ thống',
    description: 'Xác thực tài khoản bằng Email và Mật khẩu, trả về cặp JWT Token cùng thông tin Tenant.',
  })
  @ApiResponse({
    status: 200,
    description: 'Đăng nhập thành công.',
  })
  @ApiResponse({
    status: 401,
    description: 'Email hoặc mật khẩu không chính xác.',
  })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Làm mới Access Token',
    description: 'Cấp Access Token mới (15 phút) từ Refresh Token hợp lệ.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cấp token mới thành công.',
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token không hợp lệ hoặc đã hết hạn.',
  })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Lấy thông tin tài khoản hiện tại',
    description: 'Trả về hồ sơ cá nhân và thông tin doanh nghiệp từ Bearer JWT Token hợp lệ.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin tài khoản thành công.',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập hoặc Token không hợp lệ.',
  })
  async getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getMe(user.id);
  }
}
