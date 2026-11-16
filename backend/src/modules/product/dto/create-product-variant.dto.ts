import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateProductVariantDto {
  @ApiProperty({
    description: 'Tên biến thể (màu sắc, kích cỡ, công suất)',
    example: '5.6L Màu Đen Nhám',
  })
  @IsNotEmpty({ message: 'variantName không được để trống' })
  @IsString()
  @MaxLength(150)
  variantName: string;

  @ApiProperty({
    description: 'Mã quản lý kho (SKU) duy nhất trong doanh nghiệp',
    example: 'NCKD-TF-56L-BLK',
  })
  @IsNotEmpty({ message: 'sku không được để trống' })
  @IsString()
  @MaxLength(100)
  sku: string;

  @ApiPropertyOptional({
    description: 'Mã vạch Barcode EAN-13 hoặc Code-128 phục vụ quét tại quầy',
    example: '8938501230012',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  barcode?: string;

  @ApiPropertyOptional({
    description: 'Giá vốn ước tính của biến thể (VNĐ)',
    example: 1750000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Giá vốn không được nhỏ hơn 0' })
  costPrice?: number;

  @ApiProperty({
    description: 'Giá bán lẻ niêm yết tại quầy & sàn TMĐT (VNĐ)',
    example: 2490000,
  })
  @IsNumber()
  @Min(0, { message: 'Giá bán không được nhỏ hơn 0' })
  sellingPrice: number;
}
