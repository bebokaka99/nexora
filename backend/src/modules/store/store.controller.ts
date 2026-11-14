import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';

@ApiTags('Stores')
@Controller('stores')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách cửa hàng của doanh nghiệp',
    description: 'Trả về toàn bộ các chi nhánh cửa hàng kèm thông tin kho hàng mặc định trực thuộc Tenant hiện tại.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách cửa hàng thành công.',
  })
  async findAll(@CurrentTenant() tenantId: string) {
    return this.storeService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Xem chi tiết cửa hàng',
    description: 'Lấy thông tin chi tiết một chi nhánh cửa hàng theo ID.',
  })
  @ApiParam({ name: 'id', description: 'ID định danh của cửa hàng' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin cửa hàng thành công.',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy cửa hàng.',
  })
  async findById(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.storeService.findById(tenantId, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Tạo chi nhánh cửa hàng mới',
    description: 'Thêm một cửa hàng vật lý mới trực thuộc doanh nghiệp hiện tại và liên kết với kho hàng mặc định.',
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo cửa hàng mới thành công.',
  })
  @ApiResponse({
    status: 409,
    description: 'Mã cửa hàng đã tồn tại.',
  })
  async create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateStoreDto,
  ) {
    return this.storeService.create(tenantId, dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật thông tin cửa hàng',
    description: 'Chỉnh sửa tên chi nhánh, địa chỉ, hotline, kho xuất mặc định hoặc trạng thái hoạt động.',
  })
  @ApiParam({ name: 'id', description: 'ID định danh của cửa hàng' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật cửa hàng thành công.',
  })
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateStoreDto,
  ) {
    return this.storeService.update(tenantId, id, dto);
  }
}
