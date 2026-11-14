# NEXORA — GitHub Workflows & Automation

Thư mục `.github/` chứa các cấu hình tự động hóa quy trình phát triển, kiểm thử chất lượng mã nguồn (Continuous Integration) và phát hành (Continuous Deployment).

## 1. Cấu Trúc Dự Trù

```text
.github/
├── workflows/
│   ├── ci.yml                # Tự động chạy ESLint, TypeScript check, Unit tests trên Pull Request
│   └── release.yml           # Tự động hóa đánh tag phiên bản và build Docker images
├── ISSUE_TEMPLATE/           # Mẫu báo cáo lỗi và đề xuất tính năng
└── PULL_REQUEST_TEMPLATE.md  # Khung kiểm tra tiêu chí trước khi merge PR
```

## 2. Tiêu Chuẩn CI Checks Bắt Buộc

Mọi Pull Request muốn được merge vào nhánh chính (`develop` hoặc `main`) đều phải vượt qua:
- Kiểm tra cú pháp và quy chuẩn mã nguồn: `eslint .`
- Kiểm tra tính tương thích kiểu: `tsc --noEmit`
- Chạy toàn bộ bộ kiểm thử tự động: `npm test`
- Không có lỗ hổng bảo mật cấp cao trong dependencies: `npm audit`
