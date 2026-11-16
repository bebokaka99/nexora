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

export class StockTransferItemDto {
  @ApiProperty({ description: 'ID hoặc mã của biến thể sản phẩm', example: 'PROD-01' })
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

  @ApiProperty({ description: 'Số lượng cần điều chuyển', example: 5 })
  @IsNumber({}, { message: 'quantity phải là số' })
  @Min(1, { message: 'Số lượng chuyển tối thiểu là 1' })
  quantity: number;
}

export class CreateStockTransferDto {
  @ApiProperty({
    description: 'ID của kho xuất hàng điều chuyển',
    example: 'wh-001-q1',
  })
  @IsNotEmpty({ message: 'sourceWarehouseId không được để trống' })
  @IsString()
  sourceWarehouseId: string;

  @ApiProperty({
    description: 'ID của kho nhận hàng điều chuyển',
    example: 'wh-002-binh-thanh',
  })
  @IsNotEmpty({ message: 'targetWarehouseId không được để trống' })
  @IsString()
  targetWarehouseId: string;

  @ApiProperty({
    description: 'Danh sách các mặt hàng điều chuyển',
    type: [StockTransferItemDto],
  })
  @IsArray({ message: 'items phải là một mảng' })
  @ValidateNested({ each: true })
  @Type(() => StockTransferItemDto)
  items: StockTransferItemDto[];

  @ApiPropertyOptional({
    description: 'Ghi chú lý do chuyển kho hoặc ghi chú vận chuyển',
    example: 'Cân bằng tồn kho giữa CN Quận 1 và CN Bình Thạnh',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
