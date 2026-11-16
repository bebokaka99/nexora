import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { QueryOrderDto } from './dto/query-order.dto';

@ApiTags('Orders')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiOperation({
    summary: 'Tra cứu danh sách đơn hàng đa kênh tập trung',
    description:
      'Hỗ trợ tìm kiếm theo mã đơn, khách hàng, kênh bán (POS, Shopee, TikTok, Facebook), trạng thái xử lý và chi nhánh cửa hàng.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách đơn hàng đáp ứng bộ lọc tìm kiếm',
  })
  async findAll(@CurrentTenant() tenantId: string, @Query() query: QueryOrderDto) {
    return this.orderService.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Xem chi tiết đơn hàng theo ID',
    description: 'Bao gồm danh sách sản phẩm, biến thể, địa chỉ giao hàng và lịch sử vòng đời đơn hàng.',
  })
  @ApiParam({ name: 'id', description: 'ID của đơn hàng cần tra cứu' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Thông tin chi tiết đơn hàng',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy đơn hàng với ID tương ứng',
  })
  async findById(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.orderService.findById(tenantId, id);
  }

  @Post()
  @ApiOperation({
    summary: 'Tạo đơn hàng mới (POS Bán lẻ hoặc Đơn Online/Chat)',
    description:
      'Tạo đơn hàng đa kênh. Nếu là đơn POS hoàn tất ngay tại quầy, hệ thống tự động trừ kho khả dụng và thực tế (BR-ORD-001). Nếu là đơn online, tự động giữ tồn kho (BR-ORD-002).',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Đơn hàng được khởi tạo thành công',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Lỗi xung đột tồn kho: Số lượng khả dụng không đủ (ORDER_INSUFFICIENT_STOCK)',
  })
  async create(@CurrentTenant() tenantId: string, @Body() dto: CreateOrderDto) {
    return this.orderService.create(tenantId, dto);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Cập nhật trạng thái vòng đời đơn hàng',
    description:
      'Chuyển tiếp trạng thái đơn hàng (PENDING -> CONFIRMED -> PROCESSING -> SHIPPED -> COMPLETED). Khi chuyển sang SHIPPED, tự động giảm On-Hand và giải phóng Committed.',
  })
  @ApiParam({ name: 'id', description: 'ID đơn hàng cần cập nhật trạng thái' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật trạng thái thành công',
  })
  async updateStatus(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatus(tenantId, id, dto);
  }

  @Post(':id/cancel')
  @ApiOperation({
    summary: 'Hủy đơn hàng và tự động hoàn trả tồn kho',
    description:
      'Hủy đơn hàng hợp lệ và hoàn trả tồn kho đã giữ (BR-ORD-004). Đơn hàng đã giao (SHIPPED) hoặc hoàn tất (COMPLETED) không thể hủy qua API này.',
  })
  @ApiParam({ name: 'id', description: 'ID đơn hàng cần hủy' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Đơn hàng đã được hủy và tồn kho được hoàn trả thành công',
  })
  async cancel(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.orderService.cancel(tenantId, id, reason);
  }
}
