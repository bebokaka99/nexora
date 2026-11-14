# Hệ Thống Tài Liệu Kỹ Thuật & Nghiệp Vụ NEXORA

Chào mừng bạn đến với kho lưu trữ tài liệu chính thức của nền tảng **NEXORA — Commerce Management Platform**.

Tài liệu này được thiết kế để cung cấp cái nhìn toàn diện từ tầng chiến lược kinh doanh, kiến trúc kỹ thuật hệ thống, thiết kế cơ sở dữ liệu cho đến các nhiệm vụ triển khai cụ thể cho từng kỹ sư phần mềm, kiến trúc sư giải pháp và chuyên viên phân tích nghiệp vụ.

---

## 1. Quy Tắc Quản Trị Thông Tin (Information Governance)

Để tránh tình trạng giả định hoặc suy diễn sai lệch yêu cầu của khách hàng, toàn bộ thông tin trong tài liệu NEXORA được gắn nhãn minh bạch theo các trạng thái chuẩn sau:

- `[CONFIRMED]`: Thông tin và yêu cầu đã được khách hàng hoặc Product Owner chính thức phê duyệt và xác nhận.
- `[PROPOSED]`: Đề xuất giải pháp kỹ thuật hoặc nghiệp vụ từ đội ngũ kiến trúc sư/phát triển.
- `[HYPOTHESIS]`: Giả định nghiệp vụ hoặc kỹ thuật cần được đưa vào kiểm chứng thực tế trước khi phát triển.
- `[UNDECIDED]`: Vấn đề đang để ngỏ, cần tiếp tục trao đổi và thống nhất với khách hàng/đối tác.
- `[IMPLEMENTED]`: Chức năng đã được triển khai hoàn chỉnh vào mã nguồn thực tế.
- `[NOT_IMPLEMENTED]`: Chức năng chưa được triển khai mã nguồn.
- `[BLOCKED]`: Hạng mục đang bị chặn bởi các phụ thuộc kỹ thuật hoặc giấy phép của bên thứ ba.

---

## 2. Bản Đồ Tài Liệu (Documentation Sitemap)

### 📘 I. Sản Phẩm & Định Hướng Kinh Doanh (`/docs/product/`)
- [**PRODUCT.md**](./product/PRODUCT.md): Tổng quan sản phẩm NEXORA, giải pháp thị trường và năng lực cốt lõi.
- [**VISION.md**](./product/VISION.md): Tầm nhìn dài hạn và định hướng mở rộng thành Commerce Operating System.
- [**OBJECTIVES.md**](./product/OBJECTIVES.md): Mục tiêu kinh doanh, chỉ số thành công (KPIs) và mục tiêu giai đoạn MVP.
- [**TARGET_USERS.md**](./product/TARGET_USERS.md): Phân tích chân dung người dùng, hành vi và nỗi đau của từng nhóm người dùng.
- [**BUSINESS_MODEL.md**](./product/BUSINESS_MODEL.md): Mô hình kinh doanh SaaS, cơ chế thanh toán thuê bao và quản lý vòng đời Tenant.
- [**VALUE_PROPOSITION.md**](./product/VALUE_PROPOSITION.md): Bản đồ định vị giá trị khác biệt của NEXORA so với đối thủ cạnh tranh.
- [**ROADMAP.md**](./product/ROADMAP.md): Lộ trình phát triển 4 giai đoạn từ MVP đến nền tảng tự động hóa thông minh.

### 📋 II. Phân Tích Yêu Cầu (`/docs/requirements/`)
- [**REQUIREMENTS.md**](./requirements/REQUIREMENTS.md): Tổng quan phương pháp quản lý và ma trận yêu cầu.
- [**FUNCTIONAL_REQUIREMENTS.md**](./requirements/FUNCTIONAL_REQUIREMENTS.md): Danh mục chi tiết các yêu cầu chức năng (`FR-*`).
- [**NON_FUNCTIONAL_REQUIREMENTS.md**](./requirements/NON_FUNCTIONAL_REQUIREMENTS.md): Danh mục các yêu cầu phi chức năng (`NFR-*`).
- [**USER_ROLES.md**](./requirements/USER_ROLES.md): Ma trận phân quyền và vai trò người dùng (RBAC).
- [**USER_FLOWS.md**](./requirements/USER_FLOWS.md): Sơ đồ luồng thao tác người dùng chính (User Flows).
- [**USE_CASES.md**](./requirements/USE_CASES.md): Kịch bản sử dụng (Use Cases) chi tiết với các luồng rẽ nhánh.
- [**MVP_SCOPE.md**](./requirements/MVP_SCOPE.md): Ranh giới phạm vi tính năng MVP (In-Scope vs Out-of-Scope).
- [**ACCEPTANCE_CRITERIA.md**](./requirements/ACCEPTANCE_CRITERIA.md): Tiêu chí nghiệm thu chức năng theo chuẩn Given/When/Then.

### 🏗️ III. Kiến Trúc Kỹ Thuật (`/docs/architecture/`)
- [**ARCHITECTURE.md**](./architecture/ARCHITECTURE.md): Kiến trúc tổng thể Modular Monolith và các nguyên tắc thiết kế SOLID/Clean.
- [**SYSTEM_OVERVIEW.md**](./architecture/SYSTEM_OVERVIEW.md): Sơ đồ C4 Context & Container trực quan bằng Mermaid.
- [**TECH_STACK.md**](./architecture/TECH_STACK.md): Báo cáo đánh giá và luận chứng lựa chọn công nghệ.
- [**FRONTEND_ARCHITECTURE.md**](./architecture/FRONTEND_ARCHITECTURE.md): Cấu trúc Next.js App Router, quản lý State và Data Fetching.
- [**BACKEND_ARCHITECTURE.md**](./architecture/BACKEND_ARCHITECTURE.md): Cấu trúc Module NestJS, Dependency Injection và Event Driven.
- [**MULTI_TENANT.md**](./architecture/MULTI_TENANT.md): Chiến lược phân tách dữ liệu Multi-Tenant (Tenant Context & Row-Level Security).
- [**SECURITY.md**](./architecture/SECURITY.md): Chính sách bảo mật JWT rotation, RBAC, Data Encryption và Audit Logging.
- [**INTEGRATION_ARCHITECTURE.md**](./architecture/INTEGRATION_ARCHITECTURE.md): Kiến trúc tích hợp bên thứ ba (Webhooks, Rate Limiting, BullMQ).
- [**DEPLOYMENT.md**](./architecture/DEPLOYMENT.md): Hạ tầng triển khai Docker Compose, Nginx Reverse Proxy và CI/CD.

### 🗄️ IV. Thiết Kế Cơ Sở Dữ Liệu (`/docs/database/`)
- [**DATABASE.md**](./database/DATABASE.md): Tổng quan thiết kế cơ sở dữ liệu PostgreSQL cho SaaS Commerce.
- [**DATABASE_DESIGN.md**](./database/DATABASE_DESIGN.md): Chi tiết các thực thể dữ liệu và thuộc tính trường.
- [**ENTITY_RELATIONSHIPS.md**](./database/ENTITY_RELATIONSHIPS.md): Sơ đồ quan hệ thực thể (ERD) toàn hệ thống bằng Mermaid.
- [**TENANT_DATA_ISOLATION.md**](./database/TENANT_DATA_ISOLATION.md): Cơ chế cô lập dữ liệu tầng cơ sở dữ liệu.
- [**MIGRATION_STRATEGY.md**](./database/MIGRATION_STRATEGY.md): Chiến lược Prisma Migrations và quy trình triển khai không gián đoạn.

### 🔌 V. Quy Chuẩn API (`/docs/api/`)
- [**API.md**](./api/API.md): Tổng quan danh mục REST API endpoints.
- [**API_CONVENTIONS.md**](./api/API_CONVENTIONS.md): Quy ước đặt tên, phương thức HTTP, cấu trúc Payload và phân trang.
- [**AUTHENTICATION.md**](./api/AUTHENTICATION.md): Cơ chế xác thực qua Header, luồng Refresh Token và ngữ cảnh Tenant.
- [**ERROR_HANDLING.md**](./api/ERROR_HANDLING.md): Định dạng mã lỗi chuẩn và xử lý ngoại lệ toàn cục.
- [**API_VERSIONING.md**](./api/API_VERSIONING.md): Chiến lược đánh phiên bản API (`/api/v1/`).

### 📦 VI. Tài Liệu Nghiệp Vụ Module (`/docs/modules/`)
- [**README.md**](./modules/README.md): Tổng quan cấu trúc và danh mục các module nghiệp vụ.
- [**SAAS_MANAGEMENT.md**](./modules/SAAS_MANAGEMENT.md): Quản trị nền tảng SaaS và quản lý Tenants.
- [**AUTHENTICATION.md**](./modules/AUTHENTICATION.md): Xác thực tài khoản, phân quyền và bảo mật phiên.
- [**TENANT_MANAGEMENT.md**](./modules/TENANT_MANAGEMENT.md): Vòng đời doanh nghiệp và cấu hình tenant.
- [**USER_MANAGEMENT.md**](./modules/USER_MANAGEMENT.md): Quản lý người dùng, nhân sự và gán vai trò.
- [**STORE_MANAGEMENT.md**](./modules/STORE_MANAGEMENT.md): Quản lý cửa hàng vật lý và điểm bán.
- [**PRODUCT_MANAGEMENT.md**](./modules/PRODUCT_MANAGEMENT.md): Quản lý sản phẩm, danh mục, biến thể và thuộc tính.
- [**INVENTORY_MANAGEMENT.md**](./modules/INVENTORY_MANAGEMENT.md): Quản lý kho hàng, nhập/xuất/chuyển kho và xử lý tranh chấp tồn kho.
- [**ORDER_MANAGEMENT.md**](./modules/ORDER_MANAGEMENT.md): Quản lý vòng đời đơn hàng đa kênh.
- [**CUSTOMER_MANAGEMENT.md**](./modules/CUSTOMER_MANAGEMENT.md): Quản lý thông tin khách hàng và lịch sử tương tác.
- [**OMNICHANNEL.md**](./modules/OMNICHANNEL.md): Kết nối và điều phối kênh bán hàng trực tuyến.
- [**CONVERSATION_MANAGEMENT.md**](./modules/CONVERSATION_MANAGEMENT.md): Hộp thư tập trung, tin nhắn, bình luận và chốt đơn.
- [**SUBSCRIPTION_BILLING.md**](./modules/SUBSCRIPTION_BILLING.md): Quản lý gói cước dịch vụ và hóa đơn thu tiền.
- [**BUSINESS_INTELLIGENCE.md**](./modules/BUSINESS_INTELLIGENCE.md): Báo cáo phân tích doanh thu, tồn kho và hiệu suất bán hàng.

### 🌐 VII. Kết Nối Nền Tảng Bên Ngoài (`/docs/integrations/`)
- [**INTEGRATIONS.md**](./integrations/INTEGRATIONS.md): Khung kiến trúc kết nối và điều phối tích hợp.
- [**FACEBOOK.md**](./integrations/FACEBOOK.md): Meta Graph API, Messenger Platform và quy định kiểm duyệt ứng dụng.
- [**TIKTOK_SHOP.md**](./integrations/TIKTOK_SHOP.md): TikTok Shop Open API, ủy quyền và cơ chế Webhook.
- [**SHOPEE.md**](./integrations/SHOPEE.md): Shopee Open Platform API v2, chữ ký điện tử và giới hạn tần suất.
- [**SHIPPING.md**](./integrations/SHIPPING.md): Tích hợp các hãng vận chuyển nội địa (GHTK, GHN, Viettel Post).
- [**PAYMENT.md**](./integrations/PAYMENT.md): Cổng thanh toán trực tuyến và đối soát VietQR tự động.

### 💻 VIII. Hướng Dẫn Phát Triển (`/docs/development/`)
- [**DEVELOPMENT_GUIDE.md**](./development/DEVELOPMENT_GUIDE.md): Cẩm nang lập trình viên gia nhập dự án.
- [**CODING_STANDARDS.md**](./development/CODING_STANDARDS.md): Tiêu chuẩn lập trình TypeScript, React và NestJS.
- [**GIT_WORKFLOW.md**](./development/GIT_WORKFLOW.md): Quy trình phân nhánh Git và quy chuẩn commit.
- [**ENVIRONMENT_SETUP.md**](./development/ENVIRONMENT_SETUP.md): Hướng dẫn thiết lập môi trường máy cục bộ.
- [**TESTING_STRATEGY.md**](./development/TESTING_STRATEGY.md): Chiến lược viết Unit Test, E2E Test và Mocking.
- [**CONTRIBUTING.md**](./development/CONTRIBUTING.md): Hướng dẫn đóng góp mã nguồn và quy chuẩn Review PR.

### 🎯 IX. Kế Hoạch & Nhiệm Vụ Triển Khai (`/docs/tasks/`)
- [**README.md**](./tasks/README.md): Hướng dẫn sử dụng hệ thống task và quy ước trạng thái.
- [**PHASES.md**](./tasks/PHASES.md): Chi tiết lộ trình 8 Phase phát triển từ khởi tạo đến sẵn sàng vận hành.
- [**EPICS.md**](./tasks/EPICS.md): Danh mục các Epic phân bổ theo Phase.
- [**TASK_TEMPLATE.md**](./tasks/TASK_TEMPLATE.md): Biểu mẫu chuẩn để tạo task mới.
- [**Giai đoạn 01 (Foundation)**](./tasks/phase-01-foundation/): Bắt đầu với nhiệm vụ hàng đầu **TASK-001: Build NEXORA Visual Demo**.

### ⚖️ X. Quyết Định & Thuật Ngữ (`/docs/decisions/` & `/docs/glossary/`)
- [**ARCHITECTURE_DECISIONS.md**](./decisions/ARCHITECTURE_DECISIONS.md): Nhật ký các quyết định kiến trúc quan trọng (ADR) và danh mục các câu hỏi mở với khách hàng.
- [**GLOSSARY.md**](./glossary/GLOSSARY.md): Từ điển thuật ngữ chuẩn hóa Anh - Việt cho toàn hệ thống.
