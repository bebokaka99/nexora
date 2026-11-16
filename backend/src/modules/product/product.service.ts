import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WarehouseService } from '../warehouse/warehouse.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateProductDto, ProductStatusEnum } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

export interface CategoryEntity {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  createdAt: Date;
}

export interface ProductVariantEntity {
  id: string;
  tenantId: string;
  productId: string;
  sku: string;
  barcode?: string | null;
  variantName: string;
  costPrice: number;
  sellingPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductEntity {
  id: string;
  tenantId: string;
  categoryId?: string | null;
  name: string;
  slug: string;
  brand?: string | null;
  description?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  category?: CategoryEntity | null;
  variants: ProductVariantEntity[];
}

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);


  constructor(
    private readonly prisma: PrismaService,
    private readonly warehouseService: WarehouseService,
  ) {}


  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // ===========================================================================
  // I. CATEGORIES MANAGEMENT
  // ===========================================================================

  async findAllCategories(tenantId: string): Promise<CategoryEntity[]> {
    return (await this.prisma.category.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    })) as CategoryEntity[];
  }

  async createCategory(tenantId: string, dto: CreateCategoryDto): Promise<CategoryEntity> {
    const slug = dto.slug || this.generateSlug(dto.name);

    const existing = await this.prisma.category.findFirst({
      where: { tenantId, slug },
    });
    if (existing) {
      throw new ConflictException(`Danh mục với đường dẫn [${slug}] đã tồn tại trong doanh nghiệp`);
    }

    return (await this.prisma.category.create({
      data: {
        tenantId,
        name: dto.name,
        slug,
      },
    })) as CategoryEntity;
  }

  // ===========================================================================
  // II. PRODUCTS & VARIANTS MANAGEMENT
  // ===========================================================================

  async findAll(tenantId: string, query: QueryProductDto): Promise<ProductEntity[]> {
    const where: any = {
      tenantId,
      deletedAt: null,
    };

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }
    if (query.brand) {
      where.brand = query.brand;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { name: { contains: s, mode: 'insensitive' } },
        { brand: { contains: s, mode: 'insensitive' } },
        { variants: { some: { sku: { contains: s, mode: 'insensitive' } } } },
        { variants: { some: { barcode: { contains: s, mode: 'insensitive' } } } },
      ];
    }

    const products = await this.prisma.product.findMany({
      where,
      include: {
        category: true,
        variants: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return products.map((p: any) => ({
      id: p.id,
      tenantId: p.tenantId,
      categoryId: p.categoryId,
      name: p.name,
      slug: p.slug,
      brand: p.brand,
      description: p.description,
      status: p.status,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      deletedAt: p.deletedAt,
      category: p.category,
      variants: p.variants.map((v: any) => ({
        id: v.id,
        tenantId: v.tenantId,
        productId: v.productId,
        sku: v.sku,
        barcode: v.barcode,
        variantName: v.variantName,
        costPrice: Number(v.costPrice),
        sellingPrice: Number(v.sellingPrice),
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
      })),
    }));
  }

  async findById(tenantId: string, id: string): Promise<ProductEntity> {
    const p = await this.prisma.product.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { category: true, variants: true },
    });
    if (!p) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với ID: ${id}`);
    }
    return {
      id: p.id,
      tenantId: p.tenantId,
      categoryId: p.categoryId,
      name: p.name,
      slug: p.slug,
      brand: p.brand,
      description: p.description,
      status: p.status,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      deletedAt: p.deletedAt,
      category: p.category as any,
      variants: p.variants.map((v: any) => ({
        id: v.id,
        tenantId: v.tenantId,
        productId: v.productId,
        sku: v.sku,
        barcode: v.barcode,
        variantName: v.variantName,
        costPrice: Number(v.costPrice),
        sellingPrice: Number(v.sellingPrice),
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
      })),
    };
  }

  /**
   * Tra cứu nhanh sản phẩm qua Barcode cho máy quét mã vạch quầy POS
   */
  async findByBarcode(
    tenantId: string,
    barcode: string,
  ): Promise<{ product: ProductEntity; variant: ProductVariantEntity }> {
    const variant = await this.prisma.productVariant.findFirst({
      where: { tenantId, barcode },
      include: {
        product: {
          include: { category: true, variants: true },
        },
      },
    });

    if (!variant || variant.product.deletedAt) {
      throw new NotFoundException(`Không tìm thấy sản phẩm nào khớp với mã vạch: ${barcode}`);
    }

    return {
      variant: {
        id: variant.id,
        tenantId: variant.tenantId,
        productId: variant.productId,
        sku: variant.sku,
        barcode: variant.barcode,
        variantName: variant.variantName,
        costPrice: Number(variant.costPrice),
        sellingPrice: Number(variant.sellingPrice),
        createdAt: variant.createdAt,
        updatedAt: variant.updatedAt,
      },
      product: {
        id: variant.product.id,
        tenantId: variant.product.tenantId,
        categoryId: variant.product.categoryId,
        name: variant.product.name,
        slug: variant.product.slug,
        brand: variant.product.brand,
        description: variant.product.description,
        status: variant.product.status,
        createdAt: variant.product.createdAt,
        updatedAt: variant.product.updatedAt,
        deletedAt: variant.product.deletedAt,
        category: variant.product.category as any,
        variants: variant.product.variants.map((v: any) => ({
          id: v.id,
          tenantId: v.tenantId,
          productId: v.productId,
          sku: v.sku,
          barcode: v.barcode,
          variantName: v.variantName,
          costPrice: Number(v.costPrice),
          sellingPrice: Number(v.sellingPrice),
          createdAt: v.createdAt,
          updatedAt: v.updatedAt,
        })),
      },
    };
  }

  /**
   * Tạo mới sản phẩm kèm biến thể đa thuộc tính
   * Tự động khởi tạo tồn kho 0 tại tất cả các kho của Tenant
   */
  async create(tenantId: string, dto: CreateProductDto): Promise<ProductEntity> {
    const slug = dto.slug || this.generateSlug(dto.name);

    // 1. Kiểm tra SKU trùng lặp trong doanh nghiệp
    for (const v of dto.variants) {
      const existSku = await this.prisma.productVariant.findUnique({
        where: { tenantId_sku: { tenantId, sku: v.sku } },
      });
      if (existSku) {
        throw new ConflictException(`Mã SKU [${v.sku}] đã tồn tại trong doanh nghiệp`);
      }
    }

    // Kiểm tra slug
    const existSlug = await this.prisma.product.findUnique({
      where: { tenantId_slug: { tenantId, slug } },
    });
    if (existSlug) {
      throw new ConflictException(`Đường dẫn slug [${slug}] đã tồn tại`);
    }

    const product = await this.prisma.product.create({
      data: {
        tenantId,
        name: dto.name,
        slug,
        categoryId: dto.categoryId,
        brand: dto.brand,
        description: dto.description,
        status: (dto.status as any) || 'ACTIVE',
        variants: {
          create: dto.variants.map((v) => ({
            tenantId,
            sku: v.sku,
            barcode: v.barcode,
            variantName: v.variantName,
            costPrice: v.costPrice ?? 0,
            sellingPrice: v.sellingPrice,
          })),
        },
      },
      include: {
        category: true,
        variants: true,
      },
    });

    // Tự động khởi tạo bản ghi tồn kho tại tất cả các kho hàng
    const warehouses = await this.warehouseService.findAll(tenantId);
    for (const variant of product.variants) {
      for (const wh of warehouses) {
        await this.prisma.inventory.upsert({
          where: {
            tenantId_warehouseId_variantId: {
              tenantId,
              warehouseId: wh.id,
              variantId: variant.id,
            },
          },
          update: {},
          create: {
            tenantId,
            warehouseId: wh.id,
            variantId: variant.id,
            onHandQty: 0,
            committedQty: 0,
            availableQty: 0,
          },
        });
      }
    }

    this.logger.log(`[Product Created] ${product.name} (ID: ${product.id}) with ${product.variants.length} variants`);

    return {
      id: product.id,
      tenantId: product.tenantId,
      categoryId: product.categoryId,
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      description: product.description,
      status: product.status,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      deletedAt: product.deletedAt,
      category: product.category as any,
      variants: product.variants.map((v: any) => ({
        id: v.id,
        tenantId: v.tenantId,
        productId: v.productId,
        sku: v.sku,
        barcode: v.barcode,
        variantName: v.variantName,
        costPrice: Number(v.costPrice),
        sellingPrice: Number(v.sellingPrice),
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
      })),
    };
  }

  /**
   * Cập nhật thông tin sản phẩm
   */
  async update(tenantId: string, id: string, dto: UpdateProductDto): Promise<ProductEntity> {
    await this.findById(tenantId, id);

    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name,
        categoryId: dto.categoryId,
        brand: dto.brand,
        description: dto.description,
        status: dto.status as any,
      },
      include: { category: true, variants: true },
    });

    return {
      id: updated.id,
      tenantId: updated.tenantId,
      categoryId: updated.categoryId,
      name: updated.name,
      slug: updated.slug,
      brand: updated.brand,
      description: updated.description,
      status: updated.status,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      deletedAt: updated.deletedAt,
      category: updated.category as any,
      variants: updated.variants.map((v: any) => ({
        id: v.id,
        tenantId: v.tenantId,
        productId: v.productId,
        sku: v.sku,
        barcode: v.barcode,
        variantName: v.variantName,
        costPrice: Number(v.costPrice),
        sellingPrice: Number(v.sellingPrice),
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
      })),
    };
  }

  /**
   * Xóa mềm sản phẩm (Soft Delete per BR-PROD-003)
   */
  async remove(tenantId: string, id: string): Promise<{ success: boolean; message: string }> {
    await this.findById(tenantId, id);

    await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return {
      success: true,
      message: `Đã xóa mềm thành công sản phẩm ${id}`,
    };
  }
}
