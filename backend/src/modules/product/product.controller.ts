import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import { ProductService } from './product.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

@ApiTags('Products')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // ===========================================================================
  // CATEGORIES
  // ===========================================================================

  @Get('categories')
  @ApiOperation({
    summary: 'Danh sách các danh mục sản phẩm đồ gia dụng',
    description: 'Lấy toàn bộ danh mục ngành hàng thuộc phạm vi quản lý của Tenant.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách danh mục sản phẩm',
  })
  async findAllCategories(@CurrentTenant() tenantId: string) {
    return this.productService.findAllCategories(tenantId);
  }

  @Post('categories')
  @ApiOperation({
    summary: 'Tạo danh mục sản phẩm mới',
    description: 'Tạo một danh mục ngành hàng mới (ngăn trùng lặp slug trong doanh nghiệp).',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Danh mục được tạo thành công',
  })
  async createCategory(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.productService.createCategory(tenantId, dto);
  }

  // ===========================================================================
  // PRODUCTS & BARCODE LOOKUP
  // ===========================================================================

  @Get()
  @ApiOperation({
    summary: 'Danh sách sản phẩm đồ gia dụng & biến thể',
    description:
      'Tra cứu danh mục sản phẩm, hỗ trợ tìm kiếm đa năng theo tên, thương hiệu, mã SKU hoặc Barcode, lọc theo danh mục và trạng thái.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách sản phẩm kèm danh mục và các biến thể',
  })
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: QueryProductDto,
  ) {
    return this.productService.findAll(tenantId, query);
  }

  @Get('barcode/:barcode')
  @ApiOperation({
    summary: 'Tra cứu nhanh sản phẩm qua Barcode (POS Barcode Scanner)',
    description:
      'API tốc độ cao phục vụ quầy thu ngân POS: Quét mã vạch trả về biến thể sản phẩm và thông tin cha tương ứng.',
  })
  @ApiParam({ name: 'barcode', description: 'Mã vạch của sản phẩm/biến thể' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Thông tin biến thể sản phẩm khớp mã vạch',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy sản phẩm nào khớp mã vạch',
  })
  async findByBarcode(
    @CurrentTenant() tenantId: string,
    @Param('barcode') barcode: string,
  ) {
    return this.productService.findByBarcode(tenantId, barcode);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Chi tiết một sản phẩm đồ gia dụng theo ID',
    description: 'Lấy thông tin chi tiết một sản phẩm kèm toàn bộ danh sách biến thể.',
  })
  @ApiParam({ name: 'id', description: 'ID của sản phẩm' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chi tiết sản phẩm',
  })
  async findById(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.productService.findById(tenantId, id);
  }

  @Post()
  @ApiOperation({
    summary: 'Tạo sản phẩm mới kèm các biến thể đa thuộc tính',
    description:
      'Tạo sản phẩm mới, kiểm tra tính duy nhất của mã SKU trong doanh nghiệp và tự động khởi tạo tồn kho ban đầu ở các kho.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Sản phẩm và các biến thể được tạo thành công',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Mã SKU hoặc slug đã tồn tại trong doanh nghiệp',
  })
  async create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.productService.create(tenantId, dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật thông tin sản phẩm',
    description: 'Cập nhật tên, danh mục, thương hiệu, mô tả hoặc trạng thái của sản phẩm.',
  })
  @ApiParam({ name: 'id', description: 'ID của sản phẩm' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sản phẩm được cập nhật thành công',
  })
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa mềm sản phẩm (Soft Delete)',
    description:
      'Đánh dấu deletedAt để ẩn sản phẩm khỏi danh mục kinh doanh mà không làm mất tính toàn vẹn của lịch sử đơn hàng.',
  })
  @ApiParam({ name: 'id', description: 'ID của sản phẩm' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sản phẩm đã được xóa mềm thành công',
  })
  async remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.productService.remove(tenantId, id);
  }
}
