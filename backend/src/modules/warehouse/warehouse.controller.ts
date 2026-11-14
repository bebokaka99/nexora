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
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';

@ApiTags('Warehouses')
@Controller('warehouses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách kho hàng của doanh nghiệp',
    description: 'Trả về toàn bộ các kho hàng trực thuộc Tenant hiện tại (Kho tổng và kho cửa hàng).',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách kho hàng thành công.',
  })
  async findAll(@CurrentTenant() tenantId: string) {
    return this.warehouseService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Xem chi tiết kho hàng',
    description: 'Lấy thông tin chi tiết một kho hàng theo ID.',
  })
  @ApiParam({ name: 'id', description: 'ID định danh của kho hàng' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin kho hàng thành công.',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy kho hàng.',
  })
  async findById(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.warehouseService.findById(tenantId, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Tạo kho hàng mới',
    description: 'Khai báo một kho hàng mới trực thuộc doanh nghiệp hiện tại.',
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo kho hàng mới thành công.',
  })
  @ApiResponse({
    status: 409,
    description: 'Mã kho hàng đã tồn tại.',
  })
  async create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateWarehouseDto,
  ) {
    return this.warehouseService.create(tenantId, dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật thông tin kho hàng',
    description: 'Chỉnh sửa tên, địa chỉ hoặc trạng thái hoạt động của kho hàng.',
  })
  @ApiParam({ name: 'id', description: 'ID định danh của kho hàng' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật kho hàng thành công.',
  })
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWarehouseDto,
  ) {
    return this.warehouseService.update(tenantId, id, dto);
  }
}
