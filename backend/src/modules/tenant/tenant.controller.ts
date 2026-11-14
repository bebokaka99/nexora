import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';

@ApiTags('Tenant Management')
@Controller('tenant')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get('profile')
  @ApiOperation({
    summary: 'Lấy hồ sơ doanh nghiệp hiện tại',
    description: 'Trả về thông tin chi tiết của Tenant đang đăng nhập, danh sách chi nhánh cửa hàng và kho hàng liên kết.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin thành công.',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập hoặc Token không hợp lệ.',
  })
  async getProfile(@CurrentTenant() tenantId: string) {
    return this.tenantService.getProfile(tenantId);
  }

  @Get('usage')
  @ApiOperation({
    summary: 'Xem định mức và tài nguyên đã sử dụng',
    description: 'Đối chiếu số lượng chi nhánh, kho hàng, nhân viên và kênh bán hàng hiện tại so với hạn mức gói thuê bao.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy định mức sử dụng thành công.',
  })
  async getUsage(@CurrentTenant() tenantId: string) {
    return this.tenantService.getUsage(tenantId);
  }
}
