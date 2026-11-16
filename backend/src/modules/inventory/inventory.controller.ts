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
import { InventoryService } from './inventory.service';
import { CreateGoodsReceiptDto } from './dto/create-goods-receipt.dto';
import { CreateStockTransferDto } from './dto/create-stock-transfer.dto';
import { QueryInventoryDto } from './dto/query-inventory.dto';
import { ReserveStockDto } from './dto/reserve-stock.dto';

@ApiTags('Inventories')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('inventories')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({
    summary: 'Tra cứu ma trận tồn kho đa chi nhánh & kho hàng',
    description:
      'Trả về danh sách tồn kho với số lượng Thực tế (On-Hand), Đang giữ (Committed) và Khả dụng (Available). Hỗ trợ lọc theo kho và SKU.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách tồn kho được lọc theo điều kiện',
  })
  async findAll(@CurrentTenant() tenantId: string, @Query() query: QueryInventoryDto) {
    return this.inventoryService.findAll(tenantId, query);
  }

  @Post('receipts')
  @ApiOperation({
    summary: 'Lập phiếu nhập kho hàng (Goods Receipt)',
    description:
      'Nhập bổ sung số lượng hàng vào một kho hàng cụ thể, tự động cập nhật số lượng tồn thực tế và ghi sổ nhật ký.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Phiếu nhập kho được tạo và cập nhật tồn kho thành công',
  })
  async createReceipt(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateGoodsReceiptDto,
  ) {
    return this.inventoryService.createReceipt(tenantId, dto);
  }

  @Get('transfers')
  @ApiOperation({
    summary: 'Danh sách các phiếu chuyển kho nội bộ',
    description:
      'Lấy toàn bộ các phiếu chuyển kho giữa các chi nhánh hoặc từ Kho Tổng kèm trạng thái vòng đời.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách phiếu chuyển kho được sắp xếp mới nhất',
  })
  async findTransfers(@CurrentTenant() tenantId: string) {
    return this.inventoryService.findTransfers(tenantId);
  }

  @Post('transfers')
  @ApiOperation({
    summary: 'Khởi tạo phiếu chuyển kho nội bộ',
    description:
      'Tạo yêu cầu điều chuyển hàng từ kho nguồn sang kho đích. Kiểm tra tồn khả dụng tại kho nguồn trước khi cho phép tạo.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Phiếu chuyển kho được khởi tạo thành công ở trạng thái PENDING',
  })
  async createTransfer(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateStockTransferDto,
  ) {
    return this.inventoryService.createTransfer(tenantId, dto);
  }

  @Patch('transfers/:id/ship')
  @ApiOperation({
    summary: 'Xác nhận xuất hàng chuyển kho',
    description:
      'Chuyển trạng thái phiếu từ PENDING sang IN_TRANSIT, thực hiện trừ tồn kho tại kho xuất và ghi nhật ký.',
  })
  @ApiParam({ name: 'id', description: 'ID của phiếu chuyển kho' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Xuất kho thành công, hàng đang trên đường vận chuyển',
  })
  async shipTransfer(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.inventoryService.shipTransfer(tenantId, id);
  }

  @Patch('transfers/:id/receive')
  @ApiOperation({
    summary: 'Xác nhận đã nhận hàng chuyển kho',
    description:
      'Chuyển trạng thái phiếu từ IN_TRANSIT sang COMPLETED, thực hiện cộng tồn kho tại kho nhận và hoàn tất chu trình.',
  })
  @ApiParam({ name: 'id', description: 'ID của phiếu chuyển kho' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Nhập kho hoàn tất, số lượng tồn kho đích đã được ghi nhận',
  })
  async receiveTransfer(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.inventoryService.receiveTransfer(tenantId, id);
  }

  @Post('reserve')
  @ApiOperation({
    summary: 'Khóa / Trừ tồn kho đồng thời (Stock Concurrency Check)',
    description:
      'Sử dụng cơ chế khóa an toàn ngăn chặn bán vượt tồn kho (Overselling). Trả về 409 ConflictException nếu Available Qty < requested quantity.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Trừ/giữ tồn kho thành công',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'ORDER_INSUFFICIENT_STOCK: Tồn kho không đủ đáp ứng',
  })
  async reserveOrDeductStock(
    @CurrentTenant() tenantId: string,
    @Body() dto: ReserveStockDto,
  ) {
    return this.inventoryService.reserveOrDeductStock(tenantId, dto);
  }

  @Get('transactions')
  @ApiOperation({
    summary: 'Nhật ký biến động tồn kho (Audit Trail)',
    description:
      'Lấy danh sách các giao dịch nhập, xuất, điều chuyển, bán lẻ tại quầy với số dư sau mỗi lần phát sinh.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách bản ghi nhật ký biến động',
  })
  async findTransactions(
    @CurrentTenant() tenantId: string,
    @Query('warehouseId') warehouseId?: string,
  ) {
    return this.inventoryService.findTransactions(tenantId, warehouseId);
  }
}
