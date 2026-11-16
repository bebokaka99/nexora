import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatusEnum, PaymentStatusEnum } from './create-order.dto';

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'Trạng thái mới của đơn hàng',
    enum: OrderStatusEnum,
    example: OrderStatusEnum.PROCESSING,
  })
  @IsNotEmpty({ message: 'status không được để trống' })
  @IsEnum(OrderStatusEnum)
  status: OrderStatusEnum;

  @ApiPropertyOptional({
    description: 'Cập nhật trạng thái thanh toán',
    enum: PaymentStatusEnum,
    example: PaymentStatusEnum.PAID,
  })
  @IsOptional()
  @IsEnum(PaymentStatusEnum)
  paymentStatus?: PaymentStatusEnum;

  @ApiPropertyOptional({
    description: 'Ghi chú lý do chuyển trạng thái hoặc mã vận đơn',
    example: 'Đã đóng gói xong và bàn giao cho đơn vị vận chuyển SPX',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
