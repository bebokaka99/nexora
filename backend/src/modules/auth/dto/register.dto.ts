import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'Gia Dụng Hiện Đại',
    description: 'Tên doanh nghiệp hoặc thương hiệu bán lẻ',
  })
  @IsString()
  @IsNotEmpty({ message: 'Tên doanh nghiệp không được để trống' })
  companyName: string;

  @ApiProperty({
    example: 'gia-dung-hien-dai',
    description: 'Mã định danh duy nhất (slug) của doanh nghiệp',
  })
  @IsString()
  @IsNotEmpty({ message: 'Mã slug không được để trống' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Mã slug chỉ được chứa chữ thường không dấu, số và dấu gạch ngang',
  })
  slug: string;

  @ApiProperty({
    example: 'Nguyễn Văn Quản Trị',
    description: 'Họ và tên của người đại diện quản trị',
  })
  @IsString()
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  fullName: string;

  @ApiProperty({
    example: 'admin@nexora.vn',
    description: 'Địa chỉ email quản trị viên',
  })
  @IsEmail({}, { message: 'Định dạng email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @ApiProperty({
    example: 'MatKhauManh123!',
    description: 'Mật khẩu bảo vệ tài khoản (tối thiểu 8 ký tự)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(8, { message: 'Mật khẩu phải có tối thiểu 8 ký tự' })
  password: string;

  @ApiPropertyOptional({
    example: '0988777666',
    description: 'Số điện thoại liên hệ',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
