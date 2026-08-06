import type { AmenityIcon, PriceUnit, SalesStatus } from "./types";

// Danh sách tỉnh tham khảo từ src/data/projects.seed.ts — mở rộng dần khi có dự án tỉnh mới.
export const PROVINCES: { name: string; slug: string }[] = [
  { name: "TP.HCM", slug: "tp-hcm" },
  { name: "Hà Nội", slug: "ha-noi" },
  { name: "Hưng Yên", slug: "hung-yen" },
  { name: "Đồng Nai", slug: "dong-nai" },
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
