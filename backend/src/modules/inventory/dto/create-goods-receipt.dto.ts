import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GoodsReceiptItemDto {
  @ApiProperty({ description: 'ID hoặc mã SKU của biến thể sản phẩm', example: 'PROD-01' })
  @IsNotEmpty({ message: 'variantId không được để trống' })
  @IsString()
  variantId: string;

  @ApiProperty({ description: 'Mã SKU của biến thể', example: 'NCKD-TF-56L' })
  @IsNotEmpty({ message: 'sku không được để trống' })
  @IsString()
  sku: string;

  @ApiPropertyOptional({ description: 'Tên sản phẩm' })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiProperty({ description: 'Số lượng nhập kho', example: 20 })
  @IsNumber({}, { message: 'quantity phải là số' })
  @Min(1, { message: 'Số lượng nhập tối thiểu là 1' })
  quantity: number;

  @ApiPropertyOptional({ description: 'Đơn giá nhập hàng', example: 1750000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;
}

export class CreateGoodsReceiptDto {
  @ApiProperty({
    description: 'ID của kho hàng tiếp nhận nhập kho',
    example: 'wh-001-q1',
  })
  @IsNotEmpty({ message: 'warehouseId không được để trống' })
  @IsString()
  warehouseId: string;

  @ApiProperty({
    description: 'Danh sách các mặt hàng nhập kho',
    type: [GoodsReceiptItemDto],
  })
  @IsArray({ message: 'items phải là một mảng' })
  @ValidateNested({ each: true })
  @Type(() => GoodsReceiptItemDto)
  items: GoodsReceiptItemDto[];

  @ApiPropertyOptional({
    description: 'Ghi chú phiếu nhập kho hoặc mã chứng từ nhà cung cấp',
    example: 'Nhập lô hàng đồ gia dụng đợt 1 từ Tefal Việt Nam',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
