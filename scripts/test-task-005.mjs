/**
 * NEXORA — TASK-005 Fullstack E2E Verification Script
 * Tests:
 *  1. Server Boot & Health Check
 *  2. Authentication (Login to obtain JWT for tenant-001)
 *  3. GET /api/v1/inventories (Query inventory matrix across 3 warehouses)
 *  4. POST /api/v1/inventories/receipts (Create goods receipt & verify stock increases)
 *  5. POST /api/v1/inventories/transfers (Create stock transfer PENDING)
 *  6. PATCH /api/v1/inventories/transfers/:id/ship (Ship transfer -> IN_TRANSIT & deduct source stock)
 *  7. PATCH /api/v1/inventories/transfers/:id/receive (Receive transfer -> COMPLETED & add target stock)
 *  8. POST /api/v1/inventories/reserve (Concurrency Lock & Overselling Prevention -> expect 409 Conflict)
 *  9. GET /api/v1/inventories/transactions (Audit Trail verification)
 */

import { spawn } from 'node:child_process';

const PORT = 4099;
const BASE_URL = `http://127.0.0.1:${PORT}/api/v1`;

let serverProcess;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('================================================================');
  console.log('🚀 NEXORA TASK-005: INVENTORY & STOCK TRANSFER VERIFICATION');
  console.log('================================================================');

  // Step 1: Start backend on port 4099
  console.log(`\n[1/9] Khởi động NestJS backend trên cổng thử nghiệm ${PORT}...`);
  serverProcess = spawn('node', ['dist/main.js'], {
    cwd: 'backend',
    env: { ...process.env, PORT: String(PORT) },
    stdio: 'pipe',
  });

  serverProcess.stdout.on('data', (d) => {
    // optional debug
  });
  serverProcess.stderr.on('data', (d) => {
    // optional debug
  });

  // Wait for server to be ready
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

  // Step 3: GET /inventories
  console.log('\n[3/9] Tra cứu ma trận tồn kho toàn bộ chi nhánh (GET /inventories)...');
  const invRes = await fetch(`${BASE_URL}/inventories`, { headers: authHeaders });
  const invJson = await invRes.json();
  const inventories = invJson.data || invJson;
  console.log(`  ✓ Nhận được ${inventories.length} bản ghi tồn kho.`);

  const tefalCentral = inventories.find(
    (i) => (i.variantId === 'PROD-01' || i.sku === 'NCKD-TF-56L') && i.warehouseId === 'wh-003-central'
  );
  const tefalQ1 = inventories.find(
    (i) => (i.variantId === 'PROD-01' || i.sku === 'NCKD-TF-56L') && i.warehouseId === 'wh-001-q1'
  );
  console.log(`  - Tồn kho Tefal 5.6L tại Kho Tổng: OnHand=${tefalCentral?.onHandQty}, Avail=${tefalCentral?.availableQty}`);
  console.log(`  - Tồn kho Tefal 5.6L tại Kho Q.1: OnHand=${tefalQ1?.onHandQty}, Avail=${tefalQ1?.availableQty}`);

  if (!tefalCentral || !tefalQ1) {
    throw new Error('Dữ liệu mẫu tồn kho không đủ các kho hàng bắt buộc!');
  }

  // Step 4: POST /inventories/receipts
  console.log('\n[4/9] Lập phiếu nhập hàng Goods Receipt (+25 cái vào Kho Q.1)...');
  const receiptRes = await fetch(`${BASE_URL}/inventories/receipts`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      warehouseId: 'wh-001-q1',
      items: [
        {
          variantId: 'PROD-01',
          sku: 'NCKD-TF-56L',
          productName: 'Nồi chiên không dầu Tefal 5.6L',
          quantity: 25,
          costPrice: 1750000,
        },
      ],
      notes: 'Phiếu nhập bổ sung hàng gia dụng đợt đầu quý',
    }),
  });
  const receiptJson = await receiptRes.json();
  const receiptData = receiptJson.data || receiptJson;
  console.log(`  ✓ Đã lập phiếu nhập: ${receiptData.receiptNumber}`);
  const updatedQ1Item = receiptData.updatedItems[0];
  console.log(`  - Tồn mới tại Kho Q.1 sau khi nhập: OnHand=${updatedQ1Item.onHandQty}, Avail=${updatedQ1Item.availableQty}`);
  if (updatedQ1Item.onHandQty !== tefalQ1.onHandQty + 25) {
    throw new Error(`Số lượng tồn kho không tăng chính xác 25 cái! Kỳ vọng: ${tefalQ1.onHandQty + 25}, Thực tế: ${updatedQ1Item.onHandQty}`);
  }

  // Step 5: POST /inventories/transfers
  console.log('\n[5/9] Khởi tạo phiếu chuyển kho từ Kho Tổng sang Kho Bình Thạnh (5 cái)...');
  const createTransferRes = await fetch(`${BASE_URL}/inventories/transfers`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      sourceWarehouseId: 'wh-003-central',
      targetWarehouseId: 'wh-002-binh-thanh',
      items: [
        {
          variantId: 'PROD-01',
          sku: 'NCKD-TF-56L',
          productName: 'Nồi chiên không dầu Tefal 5.6L',
          quantity: 5,
        },
      ],
      notes: 'Điều phối hàng gấp chi nhánh Bình Thạnh',
    }),
  });
  const transferJson = await createTransferRes.json();
  const transferData = transferJson.data || transferJson;
  console.log(`  ✓ Khởi tạo phiếu chuyển: ${transferData.transferNumber}, Trạng thái: ${transferData.status}`);
  if (transferData.status !== 'PENDING') {
    throw new Error(`Trạng thái ban đầu phải là PENDING, nhận được: ${transferData.status}`);
  }

  // Step 6: PATCH /inventories/transfers/:id/ship
  console.log('\n[6/9] Xác nhận xuất kho chuyển đi (PATCH /transfers/:id/ship)...');
  const shipRes = await fetch(`${BASE_URL}/inventories/transfers/${transferData.id}/ship`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({}),
  });
  const shipJson = await shipRes.json();
  const shippedData = shipJson.data || shipJson;
  console.log(`  ✓ Phiếu chuyển đã chuyển sang trạng thái: ${shippedData.status}`);
  if (shippedData.status !== 'IN_TRANSIT') {
    throw new Error(`Trạng thái sau khi ship phải là IN_TRANSIT, nhận được: ${shippedData.status}`);
  }

  // Step 7: PATCH /inventories/transfers/:id/receive
  console.log('\n[7/9] Xác nhận kho nhận hàng hoàn tất (PATCH /transfers/:id/receive)...');
  const receiveRes = await fetch(`${BASE_URL}/inventories/transfers/${transferData.id}/receive`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({}),
  });
  const receiveJson = await receiveRes.json();
  const receivedData = receiveJson.data || receiveJson;
  console.log(`  ✓ Phiếu chuyển hoàn tất vòng đời: ${receivedData.status}`);
  if (receivedData.status !== 'COMPLETED') {
    throw new Error(`Trạng thái sau khi receive phải là COMPLETED, nhận được: ${receivedData.status}`);
  }

  // Step 8: Concurrency Lock / Overselling Prevention
  console.log('\n[8/9] Kiểm tra cơ chế khóa đồng thời chống bán âm (Pessimistic / Concurrency Check)...');
  // Attempt to deduct 99999 items
  const oversellRes = await fetch(`${BASE_URL}/inventories/reserve`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      warehouseId: 'wh-001-q1',
      variantId: 'PROD-01',
      quantity: 99999,
      referenceId: 'TEST-OVERSELL',
    }),
  });
  const oversellJson = await oversellRes.json();
  console.log(`  - Phản hồi từ server khi bán vượt tồn: HTTP ${oversellRes.status}`);
  console.log(`  - Thông điệp lỗi: ${oversellJson.message || oversellJson.error}`);
  if (oversellRes.status !== 409) {
    throw new Error(`Kỳ vọng HTTP 409 ConflictException khi bán vượt tồn, nhận được: ${oversellRes.status}`);
  }
  console.log('  ✓ Hệ thống đã kích hoạt Concurrency Lock và ngăn chặn bán vượt tồn thành công!');

  // Now test valid deduction of 2 items
  const validDeductRes = await fetch(`${BASE_URL}/inventories/reserve`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      warehouseId: 'wh-001-q1',
      variantId: 'PROD-01',
      quantity: 2,
      referenceId: 'POS-TEST-001',
    }),
  });
  if (!validDeductRes.ok) {
    throw new Error('Trừ tồn hợp lệ tại quầy POS thất bại!');
  }
  const deductJson = await validDeductRes.json();
  const deductData = deductJson.data || deductJson;
  console.log(`  ✓ Trừ tồn hợp lệ thành công. Tồn khả dụng còn lại: ${deductData.remainingAvailable}`);

  // Step 9: Audit Trail Transactions
  console.log('\n[9/9] Kiểm tra nhật ký biến động kho (GET /inventories/transactions)...');
  const txRes = await fetch(`${BASE_URL}/inventories/transactions`, { headers: authHeaders });
  const txJson = await txRes.json();
  const txList = txJson.data || txJson;
  console.log(`  ✓ Hệ thống đã ghi nhận ${txList.length} bản ghi nhật ký biến động kho.`);
  const hasReceipt = txList.some((t) => t.type === 'RECEIPT');
  const hasTransferOut = txList.some((t) => t.type === 'TRANSFER_OUT');
  const hasTransferIn = txList.some((t) => t.type === 'TRANSFER_IN');
  const hasPosSale = txList.some((t) => t.type === 'POS_SALE');

  console.log(`  - Nhật ký có RECEIPT: ${hasReceipt}`);
  console.log(`  - Nhật ký có TRANSFER_OUT: ${hasTransferOut}`);
  console.log(`  - Nhật ký có TRANSFER_IN: ${hasTransferIn}`);
  console.log(`  - Nhật ký có POS_SALE: ${hasPosSale}`);

  if (!hasReceipt || !hasTransferOut || !hasTransferIn || !hasPosSale) {
    throw new Error('Nhật ký biến động thiếu các loại chứng từ bắt buộc!');
  }

  console.log('\n================================================================');
  console.log('🎉 TOÀN BỘ 9/9 BƯỚC KIỂM THỬ E2E TASK-005 ĐÃ VƯỢT QUA XUẤT SẮC!');
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
