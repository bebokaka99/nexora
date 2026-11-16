/**
 * NEXORA Commerce OS — Product & Category Service
 * API client methods to manage product catalog, variants, and barcode search.
 */

import { apiClient } from '../api-client';

export interface Category {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  tenantId: string;
  productId: string;
  sku: string;
  barcode?: string | null;
  variantName: string;
  costPrice: number;
  sellingPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  tenantId: string;
  categoryId?: string | null;
  name: string;
  slug: string;
  brand?: string | null;
  description?: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  category?: Category | null;
  variants: ProductVariant[];
}

export interface CreateProductVariantInput {
  variantName: string;
  sku: string;
  barcode?: string;
  costPrice?: number;
  sellingPrice: number;
}

export interface CreateProductInput {
  name: string;
  slug?: string;
  categoryId?: string;
  brand?: string;
  description?: string;
  status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  variants: CreateProductVariantInput[];
}

export interface UpdateProductInput {
  name?: string;
  categoryId?: string;
  brand?: string;
  description?: string;
  status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
}

export const productService = {
  /**
   * Lấy danh sách toàn bộ danh mục sản phẩm của doanh nghiệp
   */
  async getCategories(): Promise<Category[]> {
    return apiClient.get<Category[]>('/products/categories');
  },

  /**
   * Tạo danh mục sản phẩm mới
   */
  async createCategory(payload: CreateCategoryInput): Promise<Category> {
    return apiClient.post<Category>('/products/categories', payload);
  },

  /**
   * Tra cứu danh sách sản phẩm (hỗ trợ tìm kiếm, lọc danh mục, thương hiệu, trạng thái)
   */
  async getProducts(params?: {
    search?: string;
    categoryId?: string;
    brand?: string;
    status?: string;
  }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.categoryId) query.set('categoryId', params.categoryId);
    if (params?.brand) query.set('brand', params.brand);
    if (params?.status) query.set('status', params.status);

    const queryString = query.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    return apiClient.get<Product[]>(endpoint);
  },

  /**
   * Xem chi tiết một sản phẩm theo ID
   */
  async getProductById(id: string): Promise<Product> {
    return apiClient.get<Product>(`/products/${id}`);
  },

  /**
   * Tra cứu nhanh sản phẩm qua Barcode phục vụ quẹt mã tại quầy thu ngân POS
   */
  async getProductByBarcode(
    barcode: string,
  ): Promise<{ product: Product; variant: ProductVariant }> {
    return apiClient.get<{ product: Product; variant: ProductVariant }>(
      `/products/barcode/${encodeURIComponent(barcode)}`,
    );
  },

  /**
   * Tạo mới sản phẩm đồ gia dụng đa biến thể
   */
  async createProduct(payload: CreateProductInput): Promise<Product> {
    return apiClient.post<Product>('/products', payload);
  },

  /**
   * Cập nhật thông tin sản phẩm
   */
  async updateProduct(id: string, payload: UpdateProductInput): Promise<Product> {
    return apiClient.patch<Product>(`/products/${id}`, payload);
  },

  /**
   * Xóa mềm sản phẩm (Soft Delete per BR-PROD-003)
   */
  async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(`/products/${id}`);
  },
};
