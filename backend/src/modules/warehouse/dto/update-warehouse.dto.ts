import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateWarehouseDto } from './create-warehouse.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateWarehouseDto extends PartialType(CreateWarehouseDto) {
  @ApiPropertyOptional({
    example: true,
    description: 'Trạng thái hoạt động của kho hàng',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
