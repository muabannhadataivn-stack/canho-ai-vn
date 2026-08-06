/**
 * Chặn nội dung AI sinh ra (F1) đề cập tới tình trạng pháp lý — trang chỉ tra cứu dữ
 * liệu công khai, không được xác nhận/ám chỉ bất kỳ điều gì về sổ đỏ, giấy phép, quyền
 * sở hữu... (rủi ro pháp lý nếu thông tin sai). Danh sách này KHÔNG được lộ ra ngoài
 * (không hiện trong thông báo lỗi cho admin) — xem admin-actions.ts publishProject().
 */
const BANNED_KEYWORDS = [
  "sổ đỏ",
  "sổ hồng",
  "giấy phép",
  "thế chấp",
  "sở hữu lâu dài",
  "quyền sử dụng đất",
  "pháp lý minh bạch",
  "đã có sổ",
];

export function containsBannedKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return BANNED_KEYWORDS.some((keyword) => lower.includes(keyword.toLowerCase()));
}
