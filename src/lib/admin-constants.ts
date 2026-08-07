import { UNRESOLVED_PROVINCE } from "./province-normalize";
import type { AmenityIcon, PriceUnit, SalesStatus } from "./types";

// Đủ 63 tỉnh/thành TRƯỚC sáp nhập 2025 (danh sách ổn định nhiều năm, không đổi) — xác minh
// qua nguồn ngoài (không lấy từ trí nhớ/huấn luyện): 58 tỉnh + 5 thành phố trực thuộc trung
// ương (Hà Nội, TP.HCM, Hải Phòng, Đà Nẵng, Cần Thơ), khớp danh sách tổng hợp từ
// dauthau.asia/news/tu-lieu-cho-nha-thau/63-tinh-thanh-viet-nam-950.html (2026-08-12).
// 7 slug đã tồn tại từ trước (tp-hcm, ha-noi, hung-yen, dong-nai, bac-ninh, can-tho, da-nang)
// GIỮ NGUYÊN không đổi — đã dùng thật trong URL công khai + provinceSlug trong DB, đổi sẽ vỡ
// dữ liệu/URL đã publish. Slug của 56 tỉnh còn lại sinh bằng đúng hàm slugify() (lib/slug.ts).
// PHẢI khớp đúng mọi provinceSlug có thể tồn tại thật trong DB — cộng UNRESOLVED_PROVINCE
// ("Chưa xác định", fallback khi CSV không nhận diện được tỉnh). Thiếu 1 giá trị ở đây khiến
// <select> hiện nhầm option đầu tiên và validate lúc lưu báo sai "Tỉnh/thành không được để trống".
export const PROVINCES: { name: string; slug: string }[] = [
  { name: "An Giang", slug: "an-giang" },
  { name: "Bà Rịa-Vũng Tàu", slug: "ba-ria-vung-tau" },
  { name: "Bắc Giang", slug: "bac-giang" },
  { name: "Bắc Kạn", slug: "bac-kan" },
  { name: "Bạc Liêu", slug: "bac-lieu" },
  { name: "Bắc Ninh", slug: "bac-ninh" },
  { name: "Bến Tre", slug: "ben-tre" },
  { name: "Bình Định", slug: "binh-dinh" },
  { name: "Bình Dương", slug: "binh-duong" },
  { name: "Bình Phước", slug: "binh-phuoc" },
  { name: "Bình Thuận", slug: "binh-thuan" },
  { name: "Cà Mau", slug: "ca-mau" },
  { name: "Cần Thơ", slug: "can-tho" },
  { name: "Cao Bằng", slug: "cao-bang" },
  { name: "Đà Nẵng", slug: "da-nang" },
  { name: "Đắk Lắk", slug: "dak-lak" },
  { name: "Đắk Nông", slug: "dak-nong" },
  { name: "Điện Biên", slug: "dien-bien" },
  { name: "Đồng Nai", slug: "dong-nai" },
  { name: "Đồng Tháp", slug: "dong-thap" },
  { name: "Gia Lai", slug: "gia-lai" },
  { name: "Hà Giang", slug: "ha-giang" },
  { name: "Hà Nam", slug: "ha-nam" },
  { name: "Hà Nội", slug: "ha-noi" },
  { name: "Hà Tĩnh", slug: "ha-tinh" },
  { name: "Hải Dương", slug: "hai-duong" },
  { name: "Hải Phòng", slug: "hai-phong" },
  { name: "Hậu Giang", slug: "hau-giang" },
  { name: "TP.HCM", slug: "tp-hcm" },
  { name: "Hòa Bình", slug: "hoa-binh" },
  { name: "Hưng Yên", slug: "hung-yen" },
  { name: "Khánh Hòa", slug: "khanh-hoa" },
  { name: "Kiên Giang", slug: "kien-giang" },
  { name: "Kon Tum", slug: "kon-tum" },
  { name: "Lai Châu", slug: "lai-chau" },
  { name: "Lâm Đồng", slug: "lam-dong" },
  { name: "Lạng Sơn", slug: "lang-son" },
  { name: "Lào Cai", slug: "lao-cai" },
  { name: "Long An", slug: "long-an" },
  { name: "Nam Định", slug: "nam-dinh" },
  { name: "Nghệ An", slug: "nghe-an" },
  { name: "Ninh Bình", slug: "ninh-binh" },
  { name: "Ninh Thuận", slug: "ninh-thuan" },
  { name: "Phú Thọ", slug: "phu-tho" },
  { name: "Phú Yên", slug: "phu-yen" },
  { name: "Quảng Bình", slug: "quang-binh" },
  { name: "Quảng Nam", slug: "quang-nam" },
  { name: "Quảng Ngãi", slug: "quang-ngai" },
  { name: "Quảng Ninh", slug: "quang-ninh" },
  { name: "Quảng Trị", slug: "quang-tri" },
  { name: "Sóc Trăng", slug: "soc-trang" },
  { name: "Sơn La", slug: "son-la" },
  { name: "Tây Ninh", slug: "tay-ninh" },
  { name: "Thái Bình", slug: "thai-binh" },
  { name: "Thái Nguyên", slug: "thai-nguyen" },
  { name: "Thanh Hóa", slug: "thanh-hoa" },
  { name: "Thừa Thiên - Huế", slug: "thua-thien-hue" },
  { name: "Tiền Giang", slug: "tien-giang" },
  { name: "Trà Vinh", slug: "tra-vinh" },
  { name: "Tuyên Quang", slug: "tuyen-quang" },
  { name: "Vĩnh Long", slug: "vinh-long" },
  { name: "Vĩnh Phúc", slug: "vinh-phuc" },
  { name: "Yên Bái", slug: "yen-bai" },
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
