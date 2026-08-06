import "server-only";
import { haversineDistanceMeters } from "./distance";
import { OVERPASS_RATE_LIMIT_MARKER } from "./admin-constants";
import type { NearbyAmenity, NearbyCategory } from "./types";

/**
 * Quét tiện ích lân cận qua Overpass API (OpenStreetMap) — thay Google Places, miễn phí
 * nhưng có chính sách fair-use (User-Agent định danh + giới hạn tốc độ gọi).
 */

const OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter";
// server công khai overpass-api.de có thể khắt khe hơn giới hạn công bố lúc tải cao —
// 3000ms an toàn hơn nhiều so với 1100ms trước đó (từng gặp 429 ở lượt thứ 3).
const MIN_DELAY_MS = 3000;
const RETRY_DELAY_MS = 5000;

const CONTACT_EMAIL = process.env.OSM_OVERPASS_CONTACT_EMAIL || "contact@canho.ai.vn";
const USER_AGENT = `canho.ai.vn/1.0 (contact: ${CONTACT_EMAIL})`;

const CATEGORY_TAG_FILTERS: Record<NearbyCategory, { key: string; value: string }[]> = {
  "truong-hoc": [{ key: "amenity", value: "school" }],
  "benh-vien": [{ key: "amenity", value: "hospital" }],
  "sieu-thi-ttTM": [
    { key: "shop", value: "mall" },
    { key: "shop", value: "supermarket" },
  ],
  "cong-vien": [{ key: "leisure", value: "park" }],
  cho: [{ key: "amenity", value: "marketplace" }],
  "ngan-hang": [{ key: "amenity", value: "bank" }],
};

function buildOverpassQuery(lat: number, lng: number, radiusMeters: number): string {
  const clauses: string[] = [];
  for (const filters of Object.values(CATEGORY_TAG_FILTERS)) {
    for (const { key, value } of filters) {
      clauses.push(`  node["${key}"="${value}"](around:${radiusMeters},${lat},${lng});`);
      clauses.push(`  way["${key}"="${value}"](around:${radiusMeters},${lat},${lng});`);
    }
  }
  return `[out:json][timeout:25];\n(\n${clauses.join("\n")}\n);\nout center;`;
}

function classifyElement(tags: Record<string, string> | undefined): NearbyCategory | null {
  if (!tags) return null;
  for (const category of Object.keys(CATEGORY_TAG_FILTERS) as NearbyCategory[]) {
    for (const { key, value } of CATEGORY_TAG_FILTERS[category]) {
      if (tags[key] === value) return category;
    }
  }
  return null;
}

interface OverpassElement {
  type: "node" | "way" | "relation";
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

// Rate limit tối thiểu 1100ms giữa các lần gọi Overpass — state ở module-level (per process),
// đủ dùng vì hiện tại chỉ gọi tuần tự từ 1 thao tác admin bấm nút tại 1 thời điểm.
let lastCallAt = 0;

async function waitForRateLimit(): Promise<void> {
  const elapsed = Date.now() - lastCallAt;
  if (elapsed < MIN_DELAY_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_DELAY_MS - elapsed));
  }
  lastCallAt = Date.now();
}

async function postOverpassQuery(query: string): Promise<Response> {
  return fetch(OVERPASS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
    },
    body: `data=${encodeURIComponent(query)}`,
    cache: "no-store",
  });
}

/**
 * Tìm tiện ích lân cận quanh (lat, lng) trong bán kính radiusMeters, qua 6 category đã
 * định nghĩa ở NearbyCategory (src/lib/types.ts). Bỏ qua kết quả không có tên — không tự
 * bịa tên nếu quét không ra dữ liệu thật (đúng nguyên tắc DATA-SCHEMA).
 */
export async function fetchNearbyAmenities(
  lat: number,
  lng: number,
  radiusMeters = 1500
): Promise<NearbyAmenity[]> {
  await waitForRateLimit();

  const query = buildOverpassQuery(lat, lng, radiusMeters);
  let response = await postOverpassQuery(query);

  if (response.status === 429) {
    // Retry đúng 1 lần sau khi đợi thêm — KHÔNG lặp vô hạn.
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    lastCallAt = Date.now(); // tính luôn lượt retry vào rate-limit tracking
    response = await postOverpassQuery(query);
  }

  if (response.status === 429) {
    throw new Error(
      `${OVERPASS_RATE_LIMIT_MARKER}: Overpass API trả về 429 (Too Many Requests) — đã thử lại 1 lần vẫn bị giới hạn.`
    );
  }
  if (!response.ok) {
    throw new Error(`Overpass API trả lỗi ${response.status}: ${response.statusText}`);
  }

  const json = (await response.json()) as OverpassResponse;

  const results: NearbyAmenity[] = [];
  const seen = new Set<string>();

  for (const el of json.elements) {
    const category = classifyElement(el.tags);
    if (!category) continue;

    const name = el.tags?.["name:vi"] || el.tags?.name;
    if (!name) continue; // không có tên → bỏ qua, không bịa tên chung chung

    const elLat = el.type === "node" ? el.lat : el.center?.lat;
    const elLng = el.type === "node" ? el.lon : el.center?.lon;
    if (elLat === undefined || elLng === undefined) continue;

    const dedupeKey = `${category}:${name}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    results.push({
      category,
      name,
      distanceMeters: Math.round(haversineDistanceMeters(lat, lng, elLat, elLng)),
    });
  }

  return results.sort((a, b) => a.distanceMeters - b.distanceMeters);
}
