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

  // In-Memory Categories Seed Data
  private inMemoryCategories: CategoryEntity[] = [
    {
      id: 'cat-01-noichien',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      name: 'Nồi chiên không dầu',
      slug: 'noi-chien-khong-dau',
      createdAt: new Date('2026-01-01'),
    },
    {
      id: 'cat-02-chao',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      name: 'Chảo chống dính',
      slug: 'chao-chong-dinh',
      createdAt: new Date('2026-01-01'),
    },
    {
      id: 'cat-03-amsieutoc',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      name: 'Ấm siêu tốc',
      slug: 'am-sieu-toc',
      createdAt: new Date('2026-01-01'),
    },
    {
      id: 'cat-04-mayxay',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      name: 'Máy xay sinh tố',
      slug: 'may-xay-sinh-to',
      createdAt: new Date('2026-01-01'),
    },
    {
      id: 'cat-05-noicom',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      name: 'Nồi cơm điện',
      slug: 'noi-com-dien',
      createdAt: new Date('2026-01-01'),
    },
  ];

  // In-Memory Products & Variants Seed Data
  private inMemoryProducts: ProductEntity[] = [
    {
      id: 'PROD-01',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      categoryId: 'cat-01-noichien',
      name: 'Nồi chiên không dầu điện tử Tefal 5.6L Easy Fry',
      slug: 'noi-chien-khong-dau-tefal-56l-easy-fry',
      brand: 'Tefal (Pháp)',
      description: 'Dung tích 5.6L, 8 chương trình nấu tự động, công nghệ khí nóng 360 độ.',
      status: 'ACTIVE',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
      deletedAt: null,
      variants: [
        {
          id: 'var-01-01',
          tenantId: 'tenant-001-gia-dung-hien-dai',
          productId: 'PROD-01',
          sku: 'NCKD-TF-56L',
          barcode: '8938501230012',
          variantName: '5.6L Tiêu Chuẩn (Đen)',
          costPrice: 1750000,
          sellingPrice: 2490000,
          createdAt: new Date('2026-01-01'),
          updatedAt: new Date('2026-01-01'),
        },
      ],
    },
    {
      id: 'PROD-02',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      categoryId: 'cat-01-noichien',
      name: 'Nồi chiên không dầu Lock&Lock 5.2L EJF351BLK',
      slug: 'noi-chien-lock-lock-52l-ejf351blk',
      brand: 'Lock&Lock',
      description: 'Lòng nồi tráng men chống dính cao cấp, nút xoay cơ học siêu bền.',
      status: 'ACTIVE',
      createdAt: new Date('2026-01-02'),
      updatedAt: new Date('2026-01-02'),
      deletedAt: null,
      variants: [
        {
          id: 'var-02-01',
          tenantId: 'tenant-001-gia-dung-hien-dai',
          productId: 'PROD-02',
          sku: 'NCKD-LL-52L',
          barcode: '8938501230029',
          variantName: '5.2L Đen Bóng',
          costPrice: 1390000,
          sellingPrice: 1950000,
          createdAt: new Date('2026-01-02'),
          updatedAt: new Date('2026-01-02'),
        },
      ],
    },
    {
      id: 'PROD-03',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      categoryId: 'cat-02-chao',
      name: 'Chảo xào chống dính Ceramic Elmich 28cm đáy từ',
      slug: 'chao-xao-ceramic-elmich-28cm',
      brand: 'Elmich',
      description: 'Men gốm Ceramic tự nhiên không giải phóng chất độc hại ở nhiệt độ cao.',
      status: 'ACTIVE',
      createdAt: new Date('2026-01-03'),
      updatedAt: new Date('2026-01-03'),
      deletedAt: null,
      variants: [
        {
          id: 'var-03-01',
          tenantId: 'tenant-001-gia-dung-hien-dai',
          productId: 'PROD-03',
          sku: 'CD-EM-28',
          barcode: '8938501230036',
          variantName: 'Đường kính 28cm',
          costPrice: 240000,
          sellingPrice: 380000,
          createdAt: new Date('2026-01-03'),
          updatedAt: new Date('2026-01-03'),
        },
      ],
    },
    {
      id: 'PROD-04',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      categoryId: 'cat-02-chao',
      name: 'Chảo chiên vân đá siêu bền Sunhouse 26cm',
      slug: 'chao-chien-van-da-sunhouse-26cm',
      brand: 'Sunhouse',
      description: 'Lớp chống dính đá hoa cương siêu bền, bắt từ nhanh chóng.',
      status: 'ACTIVE',
      createdAt: new Date('2026-01-04'),
      updatedAt: new Date('2026-01-04'),
      deletedAt: null,
      variants: [
        {
          id: 'var-04-01',
          tenantId: 'tenant-001-gia-dung-hien-dai',
          productId: 'PROD-04',
          sku: 'CD-SH-26',
          barcode: '8938501230043',
          variantName: 'Đường kính 26cm',
          costPrice: 165000,
          sellingPrice: 260000,
          createdAt: new Date('2026-01-04'),
          updatedAt: new Date('2026-01-04'),
        },
      ],
    },
    {
      id: 'PROD-05',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      categoryId: 'cat-03-amsieutoc',
      name: 'Ấm siêu tốc thủy tinh Philips 1.7L LED HD9339',
      slug: 'am-sieu-toc-thuy-tinh-philips-17l',
      brand: 'Philips',
      description: 'Thân ấm thủy tinh chịu nhiệt Schott Duran trong suốt kèm đèn LED sang trọng.',
      status: 'ACTIVE',
      createdAt: new Date('2026-01-05'),
      updatedAt: new Date('2026-01-05'),
      deletedAt: null,
      variants: [
        {
          id: 'var-05-01',
          tenantId: 'tenant-001-gia-dung-hien-dai',
          productId: 'PROD-05',
          sku: 'AST-PL-17',
          barcode: '8938501230050',
          variantName: 'Dung tích 1.7L Thủy Tinh',
          costPrice: 580000,
          sellingPrice: 890000,
          createdAt: new Date('2026-01-05'),
          updatedAt: new Date('2026-01-05'),
        },
      ],
    },
    {
      id: 'PROD-06',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      categoryId: 'cat-03-amsieutoc',
      name: 'Ấm siêu tốc Inox 304 Sunhouse 1.8L giữ nhiệt 2 lớp',
      slug: 'am-sieu-toc-inox-304-sunhouse-18l',
      brand: 'Sunhouse',
      description: 'Ruột Inox 304 nguyên khối, vỏ nhựa cách nhiệt an toàn chống bỏng.',
      status: 'ACTIVE',
      createdAt: new Date('2026-01-06'),
      updatedAt: new Date('2026-01-06'),
      deletedAt: null,
      variants: [
        {
          id: 'var-06-01',
          tenantId: 'tenant-001-gia-dung-hien-dai',
          productId: 'PROD-06',
          sku: 'AST-SH-18',
          barcode: '8938501230067',
          variantName: 'Dung tích 1.8L Inox',
          costPrice: 195000,
          sellingPrice: 320000,
          createdAt: new Date('2026-01-06'),
          updatedAt: new Date('2026-01-06'),
        },
      ],
    },
    {
      id: 'PROD-07',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      categoryId: 'cat-04-mayxay',
      name: 'Máy xay sinh tố đa năng Sunhouse 3 cối thủy tinh',
      slug: 'may-xay-sinh-to-sunhouse-3-coi',
      brand: 'Sunhouse',
      description: 'Bộ 3 cối thủy tinh xay thịt, xay tiêu và xay sinh tố tiện dụng.',
      status: 'ACTIVE',
      createdAt: new Date('2026-01-07'),
      updatedAt: new Date('2026-01-07'),
      deletedAt: null,
      variants: [
        {
          id: 'var-07-01',
          tenantId: 'tenant-001-gia-dung-hien-dai',
          productId: 'PROD-07',
          sku: 'MXST-3C-WHT',
          barcode: '8938501230074',
          variantName: 'Bộ 3 cối trắng',
          costPrice: 420000,
          sellingPrice: 690000,
          createdAt: new Date('2026-01-07'),
          updatedAt: new Date('2026-01-07'),
        },
      ],
    },
    {
      id: 'PROD-08',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      categoryId: 'cat-04-mayxay',
      name: 'Máy xay cầm tay Braun MultiQuick 5 1000W',
      slug: 'may-xay-cam-tay-braun-multiquick-5',
      brand: 'Braun (Đức)',
      description: 'Công nghệ đầu xay PowerBell hình chuông xoay nhuyễn mịn không bắn thức ăn.',
      status: 'ACTIVE',
      createdAt: new Date('2026-01-08'),
      updatedAt: new Date('2026-01-08'),
      deletedAt: null,
      variants: [
        {
          id: 'var-08-01',
          tenantId: 'tenant-001-gia-dung-hien-dai',
          productId: 'PROD-08',
          sku: 'MX-BR-MQ',
          barcode: '8938501230081',
          variantName: '1000W Cầm Tay',
          costPrice: 1150000,
          sellingPrice: 1650000,
          createdAt: new Date('2026-01-08'),
          updatedAt: new Date('2026-01-08'),
        },
      ],
    },
    {
      id: 'PROD-09',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      categoryId: 'cat-05-noicom',
      name: 'Nồi cơm điện cao tần Cuckoo 1.8L CRP-PK1000S',
      slug: 'noi-com-dien-cao-tan-cuckoo-18l',
      brand: 'Cuckoo (Hàn Quốc)',
      description: 'Công nghệ gia nhiệt IH cao tần giữ trọn hương vị gạo hảo hạng.',
      status: 'ACTIVE',
      createdAt: new Date('2026-01-09'),
      updatedAt: new Date('2026-01-09'),
      deletedAt: null,
      variants: [
        {
          id: 'var-09-01',
          tenantId: 'tenant-001-gia-dung-hien-dai',
          productId: 'PROD-09',
          sku: 'NC-CK-18L',
          barcode: '8938501230098',
          variantName: '1.8L Đỏ Mận',
          costPrice: 2450000,
          sellingPrice: 3490000,
          createdAt: new Date('2026-01-09'),
          updatedAt: new Date('2026-01-09'),
        },
      ],
    },
    {
      id: 'PROD-10',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      categoryId: 'cat-05-noicom',
      name: 'Nồi cơm điện tử nắp gài Panasonic 1.8L SR-CL188',
      slug: 'noi-com-dien-tu-panasonic-18l-sr-cl188',
      brand: 'Panasonic',
      description: '16 chế độ nấu thông minh, lòng nồi dày 2.2mm tráng kim cương chống dính.',
      status: 'ACTIVE',
      createdAt: new Date('2026-01-10'),
      updatedAt: new Date('2026-01-10'),
      deletedAt: null,
      variants: [
        {
          id: 'var-10-01',
          tenantId: 'tenant-001-gia-dung-hien-dai',
          productId: 'PROD-10',
          sku: 'NC-PN-18L',
          barcode: '8938501230104',
          variantName: '1.8L Xám Bạc',
          costPrice: 920000,
          sellingPrice: 1390000,
          createdAt: new Date('2026-01-10'),
          updatedAt: new Date('2026-01-10'),
        },
      ],
    },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly warehouseService: WarehouseService,
  ) {}

  private async isPrismaReady(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

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
    if (await this.isPrismaReady()) {
      return (await this.prisma.category.findMany({
        where: { tenantId },
        orderBy: { name: 'asc' },
      })) as CategoryEntity[];
    } else {
      return this.inMemoryCategories.filter((c) => c.tenantId === tenantId);
    }
  }

  async createCategory(tenantId: string, dto: CreateCategoryDto): Promise<CategoryEntity> {
    const slug = dto.slug || this.generateSlug(dto.name);

    if (await this.isPrismaReady()) {
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
    } else {
      const existing = this.inMemoryCategories.find(
        (c) => c.tenantId === tenantId && c.slug === slug,
      );
      if (existing) {
        throw new ConflictException(`Danh mục với đường dẫn [${slug}] đã tồn tại trong doanh nghiệp`);
      }

      const cat: CategoryEntity = {
        id: `cat-${Date.now()}`,
        tenantId,
        name: dto.name,
        slug,
        createdAt: new Date(),
      };
      this.inMemoryCategories.push(cat);
      return cat;
    }
  }

  // ===========================================================================
  // II. PRODUCTS & VARIANTS MANAGEMENT
  // ===========================================================================

  async findAll(tenantId: string, query: QueryProductDto): Promise<ProductEntity[]> {
    if (await this.isPrismaReady()) {
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
    } else {
      let filtered = this.inMemoryProducts.filter(
        (p) => p.tenantId === tenantId && !p.deletedAt,
      );

      if (query.categoryId) {
        filtered = filtered.filter((p) => p.categoryId === query.categoryId);
      }
      if (query.brand) {
        filtered = filtered.filter(
          (p) => p.brand?.toLowerCase() === query.brand!.toLowerCase(),
        );
      }
      if (query.status) {
        filtered = filtered.filter((p) => p.status === query.status);
      }
      if (query.search) {
        const term = query.search.toLowerCase().trim();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(term) ||
            p.brand?.toLowerCase().includes(term) ||
            p.variants.some(
              (v) =>
                v.sku.toLowerCase().includes(term) ||
                (v.barcode && v.barcode.includes(term)),
            ),
        );
      }

      return filtered.map((p) => ({
        ...p,
        category: this.inMemoryCategories.find((c) => c.id === p.categoryId) || null,
      }));
    }
  }

  async findById(tenantId: string, id: string): Promise<ProductEntity> {
    if (await this.isPrismaReady()) {
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
    } else {
      const p = this.inMemoryProducts.find(
        (prod) => prod.id === id && prod.tenantId === tenantId && !prod.deletedAt,
      );
      if (!p) {
        throw new NotFoundException(`Không tìm thấy sản phẩm với ID: ${id}`);
      }
      return {
        ...p,
        category: this.inMemoryCategories.find((c) => c.id === p.categoryId) || null,
      };
    }
  }

  /**
   * Tra cứu nhanh sản phẩm qua Barcode cho máy quét mã vạch quầy POS
   */
  async findByBarcode(
    tenantId: string,
    barcode: string,
  ): Promise<{ product: ProductEntity; variant: ProductVariantEntity }> {
    if (await this.isPrismaReady()) {
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
    } else {
      for (const prod of this.inMemoryProducts) {
        if (prod.deletedAt || prod.tenantId !== tenantId) continue;
        const variant = prod.variants.find((v) => v.barcode === barcode);
        if (variant) {
          return {
            product: {
              ...prod,
              category: this.inMemoryCategories.find((c) => c.id === prod.categoryId) || null,
            },
            variant,
          };
        }
      }
      throw new NotFoundException(`Không tìm thấy sản phẩm nào khớp với mã vạch: ${barcode}`);
    }
  }

  /**
   * Tạo mới sản phẩm kèm biến thể đa thuộc tính
   * Tự động khởi tạo tồn kho 0 tại tất cả các kho của Tenant
   */
  async create(tenantId: string, dto: CreateProductDto): Promise<ProductEntity> {
    const slug = dto.slug || this.generateSlug(dto.name);

    // 1. Kiểm tra SKU trùng lặp trong doanh nghiệp
    for (const v of dto.variants) {
      if (await this.isPrismaReady()) {
        const existSku = await this.prisma.productVariant.findUnique({
          where: { tenantId_sku: { tenantId, sku: v.sku } },
        });
        if (existSku) {
          throw new ConflictException(`Mã SKU [${v.sku}] đã tồn tại trong doanh nghiệp`);
        }
      } else {
        const existSku = this.inMemoryProducts
          .flatMap((p) => p.variants)
          .find((varItem) => varItem.tenantId === tenantId && varItem.sku === v.sku);
        if (existSku) {
          throw new ConflictException(`Mã SKU [${v.sku}] đã tồn tại trong doanh nghiệp`);
        }
      }
    }

    if (await this.isPrismaReady()) {
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
    } else {
      const existSlug = this.inMemoryProducts.find(
        (p) => p.tenantId === tenantId && p.slug === slug,
      );
      if (existSlug) {
        throw new ConflictException(`Đường dẫn slug [${slug}] đã tồn tại`);
      }

      const newId = `PROD-${Date.now().toString().slice(-4)}`;
      const variants: ProductVariantEntity[] = dto.variants.map((v, idx) => ({
        id: `var-${Date.now()}-${idx}`,
        tenantId,
        productId: newId,
        sku: v.sku,
        barcode: v.barcode || null,
        variantName: v.variantName,
        costPrice: v.costPrice ?? 0,
        sellingPrice: v.sellingPrice,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const product: ProductEntity = {
        id: newId,
        tenantId,
        categoryId: dto.categoryId || null,
        name: dto.name,
        slug,
        brand: dto.brand || null,
        description: dto.description || null,
        status: dto.status || 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        variants,
      };

      this.inMemoryProducts.push(product);
      this.logger.log(`[In-Memory Product Created] ${product.name} (ID: ${product.id})`);

      return {
        ...product,
        category: this.inMemoryCategories.find((c) => c.id === product.categoryId) || null,
      };
    }
  }

  /**
   * Cập nhật thông tin sản phẩm
   */
  async update(tenantId: string, id: string, dto: UpdateProductDto): Promise<ProductEntity> {
    await this.findById(tenantId, id);

    if (await this.isPrismaReady()) {
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
    } else {
      const prod = this.inMemoryProducts.find((p) => p.id === id && p.tenantId === tenantId)!;
      if (dto.name) prod.name = dto.name;
      if (dto.categoryId !== undefined) prod.categoryId = dto.categoryId;
      if (dto.brand !== undefined) prod.brand = dto.brand;
      if (dto.description !== undefined) prod.description = dto.description;
      if (dto.status) prod.status = dto.status;
      prod.updatedAt = new Date();

      return {
        ...prod,
        category: this.inMemoryCategories.find((c) => c.id === prod.categoryId) || null,
      };
    }
  }

  /**
   * Xóa mềm sản phẩm (Soft Delete per BR-PROD-003)
   */
  async remove(tenantId: string, id: string): Promise<{ success: boolean; message: string }> {
    await this.findById(tenantId, id);

    if (await this.isPrismaReady()) {
      await this.prisma.product.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } else {
      const prod = this.inMemoryProducts.find((p) => p.id === id && p.tenantId === tenantId)!;
      prod.deletedAt = new Date();
    }

    return {
      success: true,
      message: `Đã xóa mềm thành công sản phẩm ${id}`,
    };
  }
}
