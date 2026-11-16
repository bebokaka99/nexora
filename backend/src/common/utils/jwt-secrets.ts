import { ConfigService } from '@nestjs/config';

/**
 * NEXORA — JWT secrets, fail-fast (TASK-011).
 *
 * Backend KHÔNG bao giờ dùng secret JWT hardcode. Thiếu JWT_SECRET /
 * JWT_REFRESH_SECRET thì ném lỗi rõ ràng thay vì lặng lẽ ký token bằng
 * một secret mà ai đọc code cũng biết (cửa hậu tương tự tài khoản demo
 * đã gỡ ở TASK-009 / TASK-011).
 *
 * Hai lớp kiểm tra:
 *  - Khởi động: backend/src/main.ts kiểm tra process.env trước khi
 *    tạo Nest app (theo đúng mẫu TASK-009 với DATABASE_URL).
 *  - Tại chỗ dùng: các hàm dưới đây (qua ConfigService, vốn đọc cả
 *    biến môi trường lẫn file .env) để AuthService / Guard không bao
 *    giờ ký hay xác thực token khi thiếu secret, kể cả khi service
 *    được khởi tạo ngoài bootstrap (VD: test).
 */

const MISSING_SECRET_HINT =
  'Đặt secret bằng chuỗi ngẫu nhiên dài (VD: openssl rand -base64 48) ' +
  'qua biến môi trường hoặc file .env (xem .env.example). ' +
  'Không dùng giá trị mẫu / mặc định ở môi trường thật.';

export function getJwtSecret(configService: ConfigService): string {
  const secret = configService.get<string>('JWT_SECRET');
  if (!secret) {
    throw new Error(
      'NEXORA Backend không thể ký/xác thực JWT: thiếu biến môi trường JWT_SECRET. ' +
        MISSING_SECRET_HINT,
    );
  }
  return secret;
}

export function getJwtRefreshSecret(configService: ConfigService): string {
  const secret = configService.get<string>('JWT_REFRESH_SECRET');
  if (!secret) {
    throw new Error(
      'NEXORA Backend không thể ký/xác thực JWT: thiếu biến môi trường JWT_REFRESH_SECRET. ' +
        MISSING_SECRET_HINT,
    );
  }
  return secret;
}
