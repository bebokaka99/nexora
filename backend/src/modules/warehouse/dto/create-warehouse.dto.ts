import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';

export enum WarehouseTypeDto {
  CENTRAL = 'CENTRAL',
  STORE_ATTACHED = 'STORE_ATTACHED',
}

export class CreateWarehouseDto {
  @ApiProperty({
    example: 'Kho Cửa Hàng 1 — Quận 1',
    description: 'Tên định danh của kho hàng',
  })
  @IsString()
  @IsNotEmpty({ message: 'Tên kho hàng không được để trống' })
  @MaxLength(150)
  name: string;

  @ApiProperty({
    example: 'WH-HCM-01',
    description: 'Mã định danh duy nhất của kho hàng trong doanh nghiệp',
  })
  @IsString()
  @IsNotEmpty({ message: 'Mã kho không được để trống' })
  @MaxLength(50)
  code: string;

  @ApiPropertyOptional({
    enum: WarehouseTypeDto,
    default: WarehouseTypeDto.STORE_ATTACHED,
    description: 'Loại kho: CENTRAL (Kho tổng) hoặc STORE_ATTACHED (Kho gắn cửa hàng)',
  })
  @IsOptional()
  @IsEnum(WarehouseTypeDto, { message: 'Loại kho phải là CENTRAL hoặc STORE_ATTACHED' })
  type?: WarehouseTypeDto;

  @ApiPropertyOptional({
    example: '120 Hai Bà Trưng, P. Đa Kao, Q.1, TP. Hồ Chí Minh',
    description: 'Địa chỉ thực tế của kho hàng',
  })
  @IsOptional()
  @IsString()
  address?: string;
}
