import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateStoreDto } from './create-store.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateStoreDto extends PartialType(CreateStoreDto) {
  @ApiPropertyOptional({
    example: true,
    description: 'Trạng thái hoạt động của cửa hàng (true: Đang hoạt động, false: Tạm ngưng)',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
