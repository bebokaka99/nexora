import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum ChannelTypeEnum {
  POS = 'POS',
  SHOPEE = 'SHOPEE',
  TIKTOK_SHOP = 'TIKTOK_SHOP',
  FACEBOOK = 'FACEBOOK',
  MANUAL = 'MANUAL',
}

export class ConnectChannelDto {
  @ApiProperty({
    example: 'SHOPEE',
    enum: ChannelTypeEnum,
    description: 'Nền tảng kênh bán hàng',
  })
  @IsEnum(ChannelTypeEnum, { message: 'Loại kênh không hợp lệ' })
  @IsNotEmpty({ message: 'Loại kênh không được để trống' })
  channelType: ChannelTypeEnum;

  @ApiProperty({
    example: 'Shopee Mall - Gia Dụng Cao Cấp',
    description: 'Tên gian hàng hiển thị',
  })
  @IsString()
  @IsNotEmpty({ message: 'Tên gian hàng không được để trống' })
  accountName: string;

  @ApiProperty({
    example: 'shopee_shop_98214',
    description: 'ID định danh gian hàng trên sàn ngoại vi',
  })
  @IsString()
  @IsNotEmpty({ message: 'Mã tài khoản sàn không được để trống' })
  accountId: string;

  @ApiProperty({
    example: 'shopee_oauth_token_xxxxxx',
    description: 'Access Token ủy quyền của sàn',
    required: false,
  })
  @IsString()
  @IsOptional()
  accessToken?: string;

  @ApiProperty({
    example: 'shopee_refresh_token_xxxxxx',
    description: 'Refresh Token của sàn',
    required: false,
  })
  @IsString()
  @IsOptional()
  refreshToken?: string;
}

export class UpdateChannelDto {
  @ApiProperty({ example: 'Shopee Official Store', required: false })
  @IsString()
  @IsOptional()
  accountName?: string;

  @ApiProperty({ example: 'CONNECTED', enum: ['CONNECTED', 'EXPIRED', 'DISCONNECTED'], required: false })
  @IsString()
  @IsOptional()
  status?: string;
}
