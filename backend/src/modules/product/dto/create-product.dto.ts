import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  MaxLength,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProductVariantDto } from './create-product-variant.dto';

export enum ProductStatusEnum {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export class CreateProductDto {
  @ApiProperty({
    description: 'Tên sản phẩm đồ gia dụng',
    example: 'Nồi chiên không dầu điện tử Tefal 5.6L Easy Fry',
  })
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Đường dẫn định danh (Slug), tự sinh nếu để trống',
    example: 'noi-chien-khong-dau-tefal-56l',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @ApiPropertyOptional({
    description: 'ID danh mục ngành hàng',
    example: 'cat-001-noichien',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Thương hiệu sản phẩm',
    example: 'Tefal (Pháp)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string;

  @ApiPropertyOptional({
    description: 'Mô tả chi tiết và thông số kỹ thuật',
    example: 'Dung tích 5.6L, công suất 1850W, bảng điều khiển cảm ứng',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái kinh doanh của sản phẩm',
    enum: ProductStatusEnum,
    default: ProductStatusEnum.ACTIVE,
  })
  @IsOptional()
  @IsEnum(ProductStatusEnum)
  status?: ProductStatusEnum;

  @ApiProperty({
    description: 'Danh sách các biến thể của sản phẩm (tối thiểu 1 biến thể)',
    type: [CreateProductVariantDto],
  })
  @IsArray({ message: 'variants phải là một danh sách' })
  @ArrayMinSize(1, { message: 'Sản phẩm phải có ít nhất 1 biến thể' })
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants: CreateProductVariantDto[];
}
