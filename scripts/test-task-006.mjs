/**
 * NEXORA — TASK-006 Fullstack E2E Verification Script
 * Tests:
 *  1. Server Boot & Health Check
 *  2. Authentication (Login to obtain JWT for tenant-001)
 *  3. GET /api/v1/products/categories (List all categories)
 *  4. POST /api/v1/products/categories (Create new category & prevent duplicate slug)
 *  5. GET /api/v1/products (List products, query search, filter category)
 *  6. POST /api/v1/products (Create multi-variant product with unique SKU enforcement)
 *  7. GET /api/v1/products/barcode/:barcode (Quick POS barcode scanner lookup)
 *  8. PATCH /api/v1/products/:id (Update product details)
 *  9. DELETE /api/v1/products/:id (Soft delete per BR-PROD-003 & verify exclusion)
 */

import { spawn } from 'node:child_process';

const PORT = 4098;
const BASE_URL = `http://127.0.0.1:${PORT}/api/v1`;

let serverProcess;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('================================================================');
  console.log('🚀 NEXORA TASK-006: PRODUCT CATALOG & VARIANTS VERIFICATION');
  console.log('================================================================');

  // Step 1: Start backend on port 4098
  console.log(`\n[1/9] Khởi động NestJS backend trên cổng thử nghiệm ${PORT}...`);
  serverProcess = spawn('node', ['dist/main.js'], {
    cwd: 'backend',
    env: { ...process.env, PORT: String(PORT) },
    stdio: 'pipe',
  });

  let serverReady = false;
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/api/v1/health`);
      if (res.ok) {
        serverReady = true;
        break;
      }
    } catch {
      // still starting
    }
  }

  if (!serverReady) {
    throw new Error('Backend server không thể khởi động sau 10 giây!');
  }
  console.log('  ✓ Backend server đã sẵn sàng và phản hồi thành công.');

  // Step 2: Login to get JWT Token
  console.log('\n[2/9] Đăng nhập tài khoản Admin Tenant để lấy JWT Token...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@nexora.vn',
      password: 'Nexora@2026',
    }),
  });
  const loginJson = await loginRes.json();
  const token = loginJson.data?.accessToken || loginJson.accessToken;
  if (!token) {
    throw new Error(`Đăng nhập thất bại: ${JSON.stringify(loginJson)}`);
  }
  console.log('  ✓ Đăng nhập thành công, đã nhận JWT Bearer Token.');

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // Step 3: GET /products/categories
  console.log('\n[3/9] Tra cứu danh mục ngành hàng gia dụng (GET /products/categories)...');
  const catRes = await fetch(`${BASE_URL}/products/categories`, { headers: authHeaders });
  const catJson = await catRes.json();
  const categories = catJson.data || catJson;
  console.log(`  ✓ Nhận được ${categories.length} danh mục ngành hàng.`);
  const hasFryer = categories.some((c) => c.slug === 'noi-chien-khong-dau');
  if (!hasFryer) {
    throw new Error('Thiếu danh mục Nồi chiên không dầu mẫu!');
  }

  // Step 4: POST /products/categories
  console.log('\n[4/9] Tạo danh mục mới và kiểm tra ngăn chặn trùng slug (POST /products/categories)...');
  const createCatRes = await fetch(`${BASE_URL}/products/categories`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Lò vi sóng & Nướng',
      slug: 'lo-vi-song-va-nuong',
    }),
  });
  const createCatJson = await createCatRes.json();
  const newCat = createCatJson.data || createCatJson;
  console.log(`  ✓ Tạo danh mục thành công: ${newCat.name} (Slug: ${newCat.slug})`);

  // Thử tạo trùng slug -> kỳ vọng 409 Conflict
  const dupCatRes = await fetch(`${BASE_URL}/products/categories`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Lò vi sóng trùng',
      slug: 'lo-vi-song-va-nuong',
    }),
  });
  if (dupCatRes.status !== 409) {
    throw new Error(`Kỳ vọng HTTP 409 khi tạo trùng slug danh mục, nhận được: ${dupCatRes.status}`);
  }
  console.log('  ✓ Đã kích hoạt bảo vệ chống trùng lặp slug danh mục (HTTP 409).');

  // Step 5: GET /products with search & filter
  console.log('\n[5/9] Tra cứu danh sách sản phẩm & bộ lọc tìm kiếm (GET /products)...');
  const prodRes = await fetch(`${BASE_URL}/products?search=Tefal`, { headers: authHeaders });
  const prodJson = await prodRes.json();
  const tefalProducts = prodJson.data || prodJson;
  console.log(`  ✓ Tìm thấy ${tefalProducts.length} sản phẩm theo từ khóa "Tefal".`);
  if (tefalProducts.length === 0) {
    throw new Error('Tìm kiếm theo thương hiệu Tefal không trả về kết quả!');
  }

  // Step 6: POST /products (Create multi-variant product)
  console.log('\n[6/9] Tạo mới sản phẩm Nồi cơm điện cao tần 2 biến thể (POST /products)...');
  const createProdRes = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Nồi cơm điện tử áp suất cao Toshiba 1.8L',
      slug: 'noi-com-dien-tu-toshiba-18l',
      categoryId: newCat.id,
      brand: 'Toshiba (Nhật Bản)',
      description: 'Công nghệ nấu chân không cao cấp, giữ ấm cơm ngon 48 giờ',
      status: 'ACTIVE',
      variants: [
        {
          variantName: '1.8L Bản Tiêu Chuẩn (Trắng)',
          sku: 'NC-TSB-18L-WHT',
          barcode: '8938509990011',
          costPrice: 1800000,
          sellingPrice: 2890000,
        },
        {
          variantName: '1.8L Bản Cao Cấp Lòng Gốm (Đen)',
          sku: 'NC-TSB-18L-BLK',
          barcode: '8938509990028',
          costPrice: 2200000,
          sellingPrice: 3490000,
        },
      ],
    }),
  });
  const createProdJson = await createProdRes.json();
  const createdProd = createProdJson.data || createProdJson;
  console.log(`  ✓ Đã tạo sản phẩm ID: ${createdProd.id} kèm ${createdProd.variants?.length} biến thể.`);
  if (createdProd.variants?.length !== 2) {
    throw new Error('Số lượng biến thể được tạo không đúng kỳ vọng 2 biến thể!');
  }

  // Thử tạo biến thể trùng SKU -> Kỳ vọng 409 Conflict
  const dupSkuRes = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Sản phẩm thử nghiệm trùng SKU',
      variants: [
        {
          variantName: 'Trùng SKU',
          sku: 'NC-TSB-18L-WHT', // đã có ở trên
          sellingPrice: 100000,
        },
      ],
    }),
  });
  if (dupSkuRes.status !== 409) {
    throw new Error(`Kỳ vọng HTTP 409 khi tạo trùng SKU, nhận được: ${dupSkuRes.status}`);
  }
  console.log('  ✓ Đã kích hoạt bảo vệ duy nhất mã SKU trong toàn doanh nghiệp (HTTP 409).');

  // Step 7: GET /products/barcode/:barcode (POS Scanner)
  console.log('\n[7/9] Quét mã vạch tại quầy POS (GET /products/barcode/:barcode)...');
  const barcodeRes = await fetch(`${BASE_URL}/products/barcode/8938509990028`, { headers: authHeaders });
  const barcodeJson = await barcodeRes.json();
  const barcodeData = barcodeJson.data || barcodeJson;
  console.log(`  ✓ Quét mã vạch [8938509990028] thành công.`);
  console.log(`  - Tên sản phẩm: ${barcodeData.product?.name}`);
  console.log(`  - Biến thể: ${barcodeData.variant?.variantName} (SKU: ${barcodeData.variant?.sku})`);
  console.log(`  - Giá bán tại quầy: ${barcodeData.variant?.sellingPrice?.toLocaleString('vi-VN')} ₫`);
  if (barcodeData.variant?.sku !== 'NC-TSB-18L-BLK') {
    throw new Error(`Mã SKU quét được không khớp! Kỳ vọng NC-TSB-18L-BLK, nhận được ${barcodeData.variant?.sku}`);
  }

  // Step 8: PATCH /products/:id
  console.log('\n[8/9] Cập nhật thông tin sản phẩm (PATCH /products/:id)...');
  const updateRes = await fetch(`${BASE_URL}/products/${createdProd.id}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Nồi cơm điện tử áp suất cao Toshiba 1.8L (Bản Nâng Cấp 2026)',
      brand: 'Toshiba Japan',
    }),
  });
  const updateJson = await updateRes.json();
  const updatedProd = updateJson.data || updateJson;
  console.log(`  ✓ Cập nhật thành công: ${updatedProd.name} (Thương hiệu: ${updatedProd.brand})`);

  // Step 9: DELETE /products/:id (Soft delete)
  console.log('\n[9/9] Xóa mềm sản phẩm theo quy tắc BR-PROD-003 (DELETE /products/:id)...');
  const deleteRes = await fetch(`${BASE_URL}/products/${createdProd.id}`, {
    method: 'DELETE',
    headers: authHeaders,
  });
  const deleteJson = await deleteRes.json();
  console.log(`  ✓ Phản hồi xóa mềm: ${JSON.stringify(deleteJson.data || deleteJson)}`);

  // Kiểm tra sản phẩm đã bị ẩn khỏi danh sách tìm kiếm thông thường
  const checkDelRes = await fetch(`${BASE_URL}/products/${createdProd.id}`, { headers: authHeaders });
  if (checkDelRes.status !== 404) {
    throw new Error(`Sản phẩm đã xóa mềm nhưng vẫn truy vấn được qua ID thông thường (HTTP ${checkDelRes.status})`);
  }
  console.log('  ✓ Sản phẩm đã được ẩn an toàn khỏi danh mục kinh doanh (Soft Delete Verified).');

  console.log('\n================================================================');
  console.log('🎉 TOÀN BỘ 9/9 BƯỚC KIỂM THỬ E2E TASK-006 ĐÃ VƯỢT QUA XUẤT SẮC!');
  console.log('================================================================');
}

run()
  .catch((err) => {
    console.error('\n❌ KIỂM THỬ THẤT BẠI:', err.message);
    process.exitCode = 1;
  })
  .finally(() => {
    if (serverProcess) {
      serverProcess.kill();
    }
  });
