import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

/**
 * Mã hóa token đồng bộ sàn at-rest — AES-256-GCM (TASK-017).
 *
 * Trước TASK-017, `ChannelConnection.accessToken/refreshToken` lưu plaintext
 * trong PostgreSQL (SPIKE §5.1). Từ TASK-017, giá trị trong 2 cột đó LUÔN ở
 * dạng mã hóa `v1:<iv-base64>:<ciphertext-base64>:<authTag-base64>`:
 *   - Khóa 32 byte lấy từ env `SYNC_TOKEN_ENCRYPTION_KEY` (hex 64 ký tự
 *     hoặc base64 44 ký tự — sinh bằng `openssl rand -hex 32`).
 *   - IV ngẫu nhiên 12 byte cho MỖI lần mã hóa (cùng token mã hóa 2 lần
 *     cho 2 ciphertext khác nhau).
 *   - GCM auth tag xác thực toàn vẹn: sai khóa hoặc ciphertext bị sửa thì
 *     giải mã throw lỗi, không trả về dữ liệu sai lặng lẽ.
 *
 * Quy tắc an toàn (fail-fast, không fallback plaintext):
 *   - Thiếu khóa hoặc khóa sai độ dài → throw lỗi rõ ràng bằng tiếng Việt.
 *     Không bao giờ lặng lẽ lưu plaintext "cho chạy được".
 *   - Giá trị trong DB không đúng định dạng `v1:` (token plaintext cũ từ
 *     thời spike) → throw lỗi yêu cầu ủy quyền lại, không tự đoán là
 *     plaintext.
 *   - KHÔNG log token ở bất kỳ đâu — kể cả token đã mã hóa cũng không log
 *     (ciphertext vẫn là dữ liệu nhạy cảm nếu khóa lộ).
 *
 * Hàm thuần (không phụ thuộc Nest/Prisma) để test được trực tiếp.
 */

const TOKEN_FORMAT_VERSION = 'v1';
const KEY_ENV_VAR = 'SYNC_TOKEN_ENCRYPTION_KEY';

/** Đọc + kiểm tra khóa mã hóa từ env. Thiếu/sai → throw lỗi rõ ràng. */
export function getSyncTokenEncryptionKey(): Buffer {
  const raw = process.env[KEY_ENV_VAR];
  if (!raw) {
    throw new Error(
      `Thiếu biến môi trường ${KEY_ENV_VAR}: không thể mã hóa/giải mã token đồng bộ sàn. ` +
        'Đặt khóa 32 byte (sinh bằng `openssl rand -hex 32`) vào .env rồi khởi động lại backend. ' +
        'Hệ thống từ chối lưu token plaintext khi chưa có khóa.',
    );
  }
  const key = parseEncryptionKey(raw);
  if (!key) {
    throw new Error(
      `${KEY_ENV_VAR} không hợp lệ: khóa phải là 32 byte, ở dạng hex (64 ký tự) hoặc base64 (44 ký tự). ` +
        'Sinh khóa mới bằng `openssl rand -hex 32` rồi đặt lại biến này.',
    );
  }
  return key;
}

function parseEncryptionKey(raw: string): Buffer | null {
  const trimmed = raw.trim();
  // Hex: 64 ký tự [0-9a-f].
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    const buf = Buffer.from(trimmed, 'hex');
    return buf.length === 32 ? buf : null;
  }
  // Base64: thử decode, phải ra đúng 32 byte.
  try {
    const buf = Buffer.from(trimmed, 'base64');
    if (buf.length === 32 && buf.toString('base64').replace(/=+$/, '') === trimmed.replace(/=+$/, '')) {
      return buf;
    }
  } catch {
    return null;
  }
  return null;
}

/** Mã hóa một token thành chuỗi `v1:iv:ciphertext:tag` (base64). */
export function encryptToken(plaintext: string): string {
  if (!plaintext) {
    throw new Error('Không mã hóa token rỗng: token đầu vào không được để trống.');
  }
  const key = getSyncTokenEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    TOKEN_FORMAT_VERSION,
    iv.toString('base64'),
    ciphertext.toString('base64'),
    tag.toString('base64'),
  ].join(':');
}

/**
 * Giải mã một giá trị đã lưu trong DB.
 * - `null`/`undefined` (kênh chưa có token) → `null`.
 * - Không đúng định dạng `v1:` (token plaintext cũ) → throw lỗi yêu cầu
 *   ủy quyền lại — không tự đoán là plaintext.
 * - Sai khóa / ciphertext bị sửa → throw lỗi xác thực rõ ràng.
 */
export function decryptToken(stored: string | null | undefined): string | null {
  if (stored === null || stored === undefined || stored === '') return null;
  const parts = stored.split(':');
  if (parts.length !== 4 || parts[0] !== TOKEN_FORMAT_VERSION) {
    throw new Error(
      'Token đồng bộ trong DB chưa được mã hóa (định dạng cũ từ thời spike, lưu plaintext). ' +
        'Vì lý do bảo mật, hệ thống không đọc token plaintext. ' +
        'Vui lòng cho gian hàng ủy quyền OAuth lại để lưu token đã mã hóa.',
    );
  }
  const key = getSyncTokenEncryptionKey();
  const [, ivB64, ciphertextB64, tagB64] = parts;
  try {
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivB64, 'base64'));
    decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(ciphertextB64, 'base64')),
      decipher.final(),
    ]).toString('utf8');
    return plaintext;
  } catch {
    throw new Error(
      'Không giải mã được token đồng bộ: sai khóa mã hóa hoặc dữ liệu token trong DB đã bị sửa. ' +
        `Kiểm tra lại ${KEY_ENV_VAR} có đúng khóa đã dùng lúc mã hóa không. ` +
        'Nếu đã xoay khóa thì cho gian hàng ủy quyền OAuth lại.',
    );
  }
}

/** Kiểm tra nhanh một giá trị trong DB có đúng định dạng mã hóa không. */
export function isEncryptedToken(value: string | null | undefined): boolean {
  if (!value) return false;
  const parts = value.split(':');
  return parts.length === 4 && parts[0] === TOKEN_FORMAT_VERSION;
}
