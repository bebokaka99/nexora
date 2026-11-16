import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
  IsOptional,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ChannelTypeEnum {
  POS = 'POS',
  SHOPEE = 'SHOPEE',
  TIKTOK_SHOP = 'TIKTOK_SHOP',
  FACEBOOK = 'FACEBOOK',
  MANUAL = 'MANUAL',
}

export enum OrderStatusEnum {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatusEnum {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
}

export class CreateOrderItemDto {
  @ApiProperty({ description: 'ID biến thể sản phẩm', example: 'PROD-01' })
  @IsNotEmpty({ message: 'variantId không được để trống' })
  @IsString()
  variantId: string;

  @ApiProperty({ description: 'Mã SKU của biến thể', example: 'NCKD-TF-56L' })
  @IsNotEmpty({ message: 'sku không được để trống' })
  @IsString()
  sku: string;

  @ApiProperty({ description: 'Tên sản phẩm', example: 'Nồi chiên không dầu Tefal 5.6L' })
  @IsNotEmpty({ message: 'productName không được để trống' })
  @IsString()
  productName: string;

  @ApiProperty({ description: 'Số lượng mua', example: 1 })
  @IsNumber({}, { message: 'quantity phải là số' })
  @Min(1, { message: 'Số lượng mua tối thiểu là 1' })
  quantity: number;

  @ApiProperty({ description: 'Đơn giá bán niêm yết (VNĐ)', example: 2490000 })
  @IsNumber({}, { message: 'unitPrice phải là số' })
  @Min(0, { message: 'Đơn giá không được âm' })
  unitPrice: number;
}

export class CreateOrderDto {
  @ApiPropertyOptional({
    description: 'Kênh bán phát sinh đơn hàng',
    enum: ChannelTypeEnum,
    default: ChannelTypeEnum.POS,
  })
  @IsOptional()
  @IsEnum(ChannelTypeEnum)
  channelType?: ChannelTypeEnum;

  @ApiPropertyOptional({ description: 'Mã đơn hàng ngoại vi từ Shopee/TikTok/Facebook', example: 'SP-99238120' })
  @IsOptional()
  @IsString()
  externalOrderId?: string;

  @ApiPropertyOptional({ description: 'ID chi nhánh phát sinh đơn hàng', example: 'store-001-q1' })
  @IsOptional()
  @IsString()
  storeId?: string;

  @ApiPropertyOptional({ description: 'ID kho hàng xuất kho hoặc giữ hàng', example: 'wh-001-q1' })
  @IsOptional()
  @IsString()
  warehouseId?: string;

  @ApiPropertyOptional({ description: 'Họ tên khách hàng', example: 'Nguyễn Thị Minh An' })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại khách hàng', example: '0988777666' })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiPropertyOptional({ description: 'Địa chỉ giao hàng', example: '120 Hai Bà Trưng, P. Đa Kao, Q.1, TP. HCM' })
  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @ApiProperty({
    description: 'Danh sách các mặt hàng trong đơn hàng',
    type: [CreateOrderItemDto],
  })
  @IsArray({ message: 'items phải là một mảng' })
  @ArrayMinSize(1, { message: 'Đơn hàng phải có ít nhất 1 mặt hàng' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiPropertyOptional({ description: 'Số tiền chiết khấu / giảm giá (VNĐ)', example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({
    description: 'Trạng thái xử lý của đơn hàng',
    enum: OrderStatusEnum,
    default: OrderStatusEnum.COMPLETED,
  })
  @IsOptional()
  @IsEnum(OrderStatusEnum)
  status?: OrderStatusEnum;

  @ApiPropertyOptional({
    description: 'Trạng thái thanh toán',
    enum: PaymentStatusEnum,
    default: PaymentStatusEnum.PAID,
  })
  @IsOptional()
  @IsEnum(PaymentStatusEnum)
  paymentStatus?: PaymentStatusEnum;

  @ApiPropertyOptional({
    description: 'Phương thức thanh toán',
    example: 'Tiền mặt',
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
