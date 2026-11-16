import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryInventoryDto {
  @ApiPropertyOptional({
    description: 'Lọc tồn kho theo ID kho hàng',
    example: 'wh-001-q1',
  })
  @IsOptional()
  @IsString()
  warehouseId?: string;

  @ApiPropertyOptional({
    description: 'Lọc tồn kho theo mã SKU',
    example: 'NCKD-TF-56L',
  })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({
    description: 'Chỉ hiển thị các mặt hàng sắp hết tồn kho (Available <= 5)',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  lowStockOnly?: boolean;
}
