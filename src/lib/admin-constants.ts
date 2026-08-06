import { UNRESOLVED_PROVINCE } from "./province-normalize";
import type { AmenityIcon, PriceUnit, SalesStatus } from "./types";

// PHẢI khớp đúng mọi provinceSlug có thể tồn tại thật trong DB — gồm các tỉnh
// province-normalize.ts (import CSV) nhận diện được, cộng UNRESOLVED_PROVINCE
// ("Chưa xác định", fallback khi CSV không nhận diện được tỉnh). Thiếu 1 giá trị ở đây
// khiến <select> hiện nhầm option đầu tiên (hành vi mặc định của HTML select khi value
// không khớp option nào) và validate lúc lưu báo sai "Tỉnh/thành không được để trống"
// dù dự án đã có provinceSlug hợp lệ — đã xảy ra thật với dự án "chua-xac-dinh"/"bac-ninh"/
// "can-tho"/"da-nang" trước khi thêm đủ vào danh sách này.
export const PROVINCES: { name: string; slug: string }[] = [
  { name: "TP.HCM", slug: "tp-hcm" },
  { name: "Hà Nội", slug: "ha-noi" },
  { name: "Hưng Yên", slug: "hung-yen" },
  { name: "Đồng Nai", slug: "dong-nai" },
  { name: "Bắc Ninh", slug: "bac-ninh" },
  { name: "Cần Thơ", slug: "can-tho" },
  { name: "Đà Nẵng", slug: "da-nang" },
  UNRESOLVED_PROVINCE,
];

export const SALES_STATUS_OPTIONS: { value: SalesStatus; label: string }[] = [
  { value: "sap-mo-ban", label: "Sắp mở bán" },
  { value: "dang-mo-ban", label: "Đang mở bán" },
  { value: "da-ban-giao", label: "Đã bàn giao" },
  { value: "dang-cap-nhat", label: "Đang cập nhật" },
];

export const PRICE_UNIT_OPTIONS: { value: PriceUnit; label: string }[] = [
  { value: "trieu-m2", label: "Triệu/m²" },
  { value: "ty-can", label: "Tỷ/căn" },
];

export const AMENITY_ICON_OPTIONS: { value: AmenityIcon; label: string }[] = [
  { value: "park", label: "Công viên" },
  { value: "pool", label: "Hồ bơi" },
  { value: "school", label: "Trường học" },
  { value: "mall", label: "TTTM" },
  { value: "sport", label: "Thể thao" },
  { value: "bus", label: "Xe buýt" },
  { value: "security", label: "An ninh" },
  { value: "elevator", label: "Thang máy" },
  { value: "parking", label: "Bãi đỗ xe" },
  { value: "default", label: "Khác" },
];

export const VN_LAT_RANGE = { min: 8, max: 24 };
export const VN_LNG_RANGE = { min: 102, max: 110 };

// Đánh dấu lỗi 429 (rate-limited) từ Overpass API (src/lib/osm-places.ts) để
// BulkScanClient.tsx (client, không được import file "server-only") nhận diện qua
// chuỗi lỗi trả về từ Server Action, thay vì phải import trực tiếp module server.
export const OVERPASS_RATE_LIMIT_MARKER = "OVERPASS_RATE_LIMITED";
