import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class ReserveStockDto {
  @ApiProperty({ description: 'ID của kho hàng xuất bán', example: 'wh-001-q1' })
  @IsNotEmpty({ message: 'warehouseId không được để trống' })
  @IsString()
  warehouseId: string;

  @ApiProperty({ description: 'ID hoặc mã của biến thể sản phẩm', example: 'PROD-01' })
  @IsNotEmpty({ message: 'variantId không được để trống' })
  @IsString()
  variantId: string;

  @ApiProperty({ description: 'Số lượng cần giữ hoặc xuất bán', example: 1 })
  @IsNumber({}, { message: 'quantity phải là số' })
  @Min(1, { message: 'Số lượng tối thiểu là 1' })
  quantity: number;

  @ApiPropertyOptional({
    description: 'Mã tham chiếu đơn hàng hoặc phiên POS',
    example: 'ORD-2026-001',
  })
  @IsOptional()
  @IsString()
  referenceId?: string;
}
