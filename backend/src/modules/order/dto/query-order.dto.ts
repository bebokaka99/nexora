import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ChannelTypeEnum, OrderStatusEnum, PaymentStatusEnum } from './create-order.dto';

export class QueryOrderDto {
  @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm theo mã đơn, tên khách hoặc SĐT' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ChannelTypeEnum, description: 'Lọc theo kênh bán hàng' })
  @IsOptional()
  @IsEnum(ChannelTypeEnum)
  channelType?: ChannelTypeEnum;

  @ApiPropertyOptional({ enum: OrderStatusEnum, description: 'Lọc theo trạng thái xử lý đơn' })
  @IsOptional()
  @IsEnum(OrderStatusEnum)
  status?: OrderStatusEnum;

  @ApiPropertyOptional({ enum: PaymentStatusEnum, description: 'Lọc theo trạng thái thanh toán' })
  @IsOptional()
  @IsEnum(PaymentStatusEnum)
  paymentStatus?: PaymentStatusEnum;

  @ApiPropertyOptional({ description: 'Lọc theo chi nhánh cửa hàng' })
  @IsOptional()
  @IsString()
  storeId?: string;
}
