import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Tên danh mục sản phẩm',
    example: 'Nồi chiên không dầu',
  })
  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Đường dẫn định danh (Slug)',
    example: 'noi-chien-khong-dau',
  })
  @IsNotEmpty({ message: 'Slug không được để trống' })
  @IsString()
  @MaxLength(120)
  slug: string;
}
