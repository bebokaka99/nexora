import {
  Controller,
  Get,
  Post,
  Delete,
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
import { ChannelService } from './channel.service';
import { ConnectChannelDto } from './dto/channel.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-user.decorator';

@ApiTags('Channels')
@Controller('channels')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách các kênh bán hàng & sàn TMĐT đã kết nối',
    description: 'Trả về toàn bộ gian hàng Shopee, TikTok Shop, Facebook Fanpage của Tenant hiện tại.',
  })
  @ApiResponse({ status: 200, description: 'Lấy danh sách kênh thành công' })
  async findAll(@CurrentTenant() tenantId: string) {
    return this.channelService.findAll(tenantId || 'tenant-demo-giadung');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết kết nối gian hàng' })
  @ApiParam({ name: 'id', description: 'ID định danh kết nối' })
  async findById(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.channelService.findById(tenantId || 'tenant-demo-giadung', id);
  }

  @Post('connect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Ủy quyền / Kết nối gian hàng mới (Shopee, TikTok Shop, Meta)',
    description: 'Lưu trữ thông tin liên kết tài khoản sàn ngoại vi kèm Access/Refresh Token.',
  })
  @ApiResponse({ status: 200, description: 'Kết nối gian hàng thành công' })
  async connect(@CurrentTenant() tenantId: string, @Body() dto: ConnectChannelDto) {
    return this.channelService.connect(tenantId || 'tenant-demo-giadung', dto);
  }

  @Post(':id/sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Kích hoạt đồng bộ đơn hàng & tồn kho tức thời',
    description:
      'TASK-013: enqueue 2 job thật (sync-inventory + pull-orders) vào BullMQ queue "channel-sync", trả về job id. Không còn cập nhật lastSyncAt giả — mốc này chỉ đổi khi worker chạy xong thành công.',
  })
  @ApiParam({ name: 'id', description: 'ID kết nối gian hàng' })
  async sync(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.channelService.sync(tenantId || 'tenant-demo-giadung', id);
  }

  @Get(':id/sync-status')
  @ApiOperation({
    summary: 'Trạng thái đồng bộ gần nhất của gian hàng',
    description: 'TASK-013: trả về SyncLog gần nhất (loại job, trạng thái, số thành công/thất bại, lỗi).',
  })
  @ApiParam({ name: 'id', description: 'ID kết nối gian hàng' })
  async getSyncStatus(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.channelService.getSyncStatus(tenantId || 'tenant-demo-giadung', id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hủy kết nối gian hàng' })
  @ApiParam({ name: 'id', description: 'ID kết nối gian hàng' })
  async disconnect(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.channelService.disconnect(tenantId || 'tenant-demo-giadung', id);
  }
}
