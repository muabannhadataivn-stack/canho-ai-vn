import "server-only";
import { supabaseServer } from "./supabase-server";

/**
 * Theo dõi & chặn ngân sách Google API ($10/tháng) — dùng bảng api_budget_status
 * (1 dòng/tháng, tổng chi phí) + api_usage_log (audit trail từng lượt gọi).
 * Schema xem supabase/migrations/20260804000000_init.sql — đã đủ dùng, không cần
 * migration mới cho E1.
 *
 * CÁCH DÙNG DỰ KIẾN Ở E2 (Google Places — tiện ích lân cận) / E3 (Distance Matrix —
 * khoảng cách di chuyển):
 *
 *   if (!(await canAffordCall(PLACES_NEARBY_SEARCH_COST_USD))) {
 *     // KHÔNG được gọi Google Places API. Phải đánh dấu dự án đó "cần xác minh thủ công"
 *     // (thiết kế cụ thể field/flag ở E2 — chưa có trong schema hiện tại) thay vì bỏ trống
 *     // nearbyAmenities một cách im lặng, vì CTV sẽ hiểu nhầm "đã quét nhưng không có gì gần"
 *     // thay vì "chưa quét được vì hết ngân sách tháng này".
 *     return markProjectNeedsVerification(projectId, "vuot-ngan-sach-api");
 *   }
 *
 *   const places = await callGooglePlacesNearbySearch(project.location);
 *   await recordApiUsage("places_nearby_search", project.id, PLACES_NEARBY_SEARCH_COST_USD);
 *
 * Tương tự cho Distance Matrix (E3) với DISTANCE_MATRIX_COST_USD.
 */

export const MONTHLY_BUDGET_USD = 10;

// Giá ước tính mỗi lượt gọi — chỉnh lại đây nếu Google đổi giá, không rải rác trong code gọi API.
export const PLACES_NEARBY_SEARCH_COST_USD = 0.032; // Essentials tier, field mask tối thiểu
export const DISTANCE_MATRIX_COST_USD = 0.005; // rẻ, nằm trong 5000 phần tử miễn phí/tháng — vẫn log để theo dõi

// "month" trong api_budget_status là ngày đầu tháng (VD: 2026-08-01) — dùng UTC để tránh
// lệch múi giờ giữa server và máy CTV.
function currentMonthKey(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

/** Đọc tổng chi phí tháng hiện tại — tự tạo dòng mới (= 0) nếu tháng này chưa có. */
export async function getCurrentMonthSpend(): Promise<number> {
  const month = currentMonthKey();

  const { data, error } = await supabaseServer
    .from("api_budget_status")
    .select("total_spent_usd")
    .eq("month", month)
    .maybeSingle();
  if (error) throw error;
  if (data) return Number(data.total_spent_usd);

  const { error: insertError } = await supabaseServer
    .from("api_budget_status")
    .insert({ month, total_spent_usd: 0, is_capped: false });
  // 23505 = trùng khoá — có thể 1 request khác vừa tạo dòng này song song, bỏ qua an toàn.
  if (insertError && insertError.code !== "23505") throw insertError;

  return 0;
}

/**
 * true nếu (chi phí đã dùng tháng này + estimatedCost) vẫn còn trong ngân sách $10/tháng.
 * Nơi gọi PHẢI kiểm tra hàm này TRƯỚC khi gọi Google API thật — trả về false thì dừng lại,
 * không gọi API, xem hướng dẫn ở đầu file.
 */
export async function canAffordCall(estimatedCost: number): Promise<boolean> {
  const currentSpend = await getCurrentMonthSpend();
  return currentSpend + estimatedCost <= MONTHLY_BUDGET_USD;
}

/**
 * Ghi 1 dòng audit vào api_usage_log + cộng dồn vào api_budget_status.total_spent_usd
 * của tháng hiện tại. Set is_capped = true nếu tổng vượt $10.
 *
 * LƯU Ý: đọc-rồi-ghi không atomic (không dùng SQL increment nguyên tử) — chấp nhận được ở
 * quy mô gọi API hiện tại (CTV thao tác tuần tự qua UI admin, không có nhiều request đồng
 * thời). Nếu sau này có gọi API song song nhiều nơi, cần chuyển sang RPC tăng nguyên tử.
 */
export async function recordApiUsage(
  apiName: string,
  projectId: string | null,
  costEstimate: number
): Promise<void> {
  const month = currentMonthKey();

  const { error: logError } = await supabaseServer
    .from("api_usage_log")
    .insert({ api_name: apiName, project_id: projectId, cost_estimate_usd: costEstimate });
  if (logError) throw logError;

  // Đảm bảo dòng tháng hiện tại tồn tại (tự tạo nếu chưa có) trước khi cộng dồn.
  const currentSpend = await getCurrentMonthSpend();
  const nextTotal = currentSpend + costEstimate;

  const { error: updateError } = await supabaseServer
    .from("api_budget_status")
    .update({ total_spent_usd: nextTotal, is_capped: nextTotal > MONTHLY_BUDGET_USD })
    .eq("month", month);
  if (updateError) throw updateError;
}
