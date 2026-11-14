import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateStoreDto {
  @ApiProperty({
    example: 'Cửa Hàng 1 — Chi nhánh Quận 1',
    description: 'Tên hiển thị của cửa hàng bán lẻ',
  })
  @IsString()
  @IsNotEmpty({ message: 'Tên cửa hàng không được để trống' })
  @MaxLength(150)
  name: string;

  @ApiProperty({
    example: 'STORE-HCM-01',
    description: 'Mã định danh duy nhất của cửa hàng trong doanh nghiệp',
  })
  @IsString()
  @IsNotEmpty({ message: 'Mã cửa hàng không được để trống' })
  @MaxLength(50)
  code: string;

  @ApiProperty({
    example: '120 Hai Bà Trưng, P. Đa Kao, Q.1, TP. Hồ Chí Minh',
    description: 'Địa chỉ mặt bằng vật lý của chi nhánh',
  })
  @IsString()
  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  address: string;

  @ApiPropertyOptional({
    example: '028 3822 9999',
    description: 'Số điện thoại hotline của cửa hàng',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: 'wh-001-q1',
    description: 'ID của kho hàng mặc định gắn với cửa hàng (xuất hàng khi bán tại quầy POS)',
  })
  @IsOptional()
  @IsString()
  defaultWarehouseId?: string;
}
