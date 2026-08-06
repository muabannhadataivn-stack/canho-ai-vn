"use server";

import { supabaseServer } from "./supabase-server";
import { assembleProjects } from "./data-source";
import { slugify } from "./slug";
import { VN_LAT_RANGE, VN_LNG_RANGE } from "./admin-constants";
import type { ProjectRow } from "./supabase-mapping";
import { hasAmenitiesData } from "@/components/project/AmenitiesSection";
import { hasPricingData } from "@/components/project/PricingTable";
import { fetchNearbyAmenities } from "./osm-places";
import { distanceToProvinceCenter } from "./distance";
import { recordApiUsage } from "./api-budget";
import type { AmenityIcon, NearbyAmenity, PriceUnit, ProjectWithTier, SalesStatus } from "./types";

/**
 * Server Actions riêng cho khu vực /admin (bảo vệ bởi src/middleware.ts) — KHÔNG import vào
 * component công khai. Dùng supabaseServer (service_role) — bỏ qua RLS, chỉ an toàn vì middleware
 * đã chặn truy cập trước khi request tới được đây.
 */

const SALES_STATUSES: SalesStatus[] = ["sap-mo-ban", "dang-mo-ban", "da-ban-giao", "dang-cap-nhat"];
const PRICE_UNITS: PriceUnit[] = ["trieu-m2", "ty-can"];
const AMENITY_ICONS: AmenityIcon[] = [
  "park",
  "pool",
  "school",
  "mall",
  "sport",
  "bus",
  "security",
  "elevator",
  "parking",
  "default",
];

export interface ActionResult {
  ok: boolean;
  error?: string;
  warning?: string;
  projectId?: string;
}

// ---- Helper dùng chung giữa createProject và updateProject ----

function parseOptionalNumber(raw: string, label: string): { value?: number; error?: string } {
  if (raw.trim() === "") return {};
  const value = Number(raw);
  if (Number.isNaN(value)) return { error: `${label} không phải số hợp lệ.` };
  return { value };
}

// Toạ độ Việt Nam thô — chỉ để CẢNH BÁO, không chặn lưu (CTV có thể gõ nhầm, sửa lại sau).
function coordOutOfRangeWarning(lat: number | undefined, lng: number | undefined): string | undefined {
  const outOfRange =
    (lat !== undefined && (lat < VN_LAT_RANGE.min || lat > VN_LAT_RANGE.max)) ||
    (lng !== undefined && (lng < VN_LNG_RANGE.min || lng > VN_LNG_RANGE.max));
  return outOfRange
    ? "Toạ độ nằm ngoài khoảng Việt Nam thô (lat 8–24, lng 102–110) — đã lưu, kiểm tra lại nếu cần."
    : undefined;
}

function parseJsonArray(raw: FormDataEntryValue | null): unknown[] {
  if (typeof raw !== "string" || raw.trim() === "") return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Xoá toàn bộ dòng cũ rồi insert dòng mới — đơn giản nhất cho danh sách động ở quy mô này.
async function replaceChildRows(
  table: "project_amenities" | "project_timeline" | "project_fit_for",
  projectId: string,
  rows: Record<string, unknown>[]
): Promise<string | null> {
  const del = await supabaseServer.from(table).delete().eq("project_id", projectId);
  if (del.error) return del.error.message;
  if (rows.length === 0) return null;
  const ins = await supabaseServer.from(table).insert(rows);
  return ins.error?.message ?? null;
}

// ============================================================
// createProject — D2
// ============================================================

export async function createProject(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const province = String(formData.get("province") ?? "").trim();
  const provinceSlug = String(formData.get("provinceSlug") ?? "").trim();
  const district = String(formData.get("district") ?? "").trim();
  const salesStatus = String(formData.get("salesStatus") ?? "");

  if (!name) return { ok: false, error: "Tên dự án không được để trống." };
  if (!province || !provinceSlug) return { ok: false, error: "Tỉnh/thành không được để trống." };
  if (!SALES_STATUSES.includes(salesStatus as SalesStatus)) {
    return { ok: false, error: "Trạng thái mở bán không hợp lệ." };
  }

  const latResult = parseOptionalNumber(String(formData.get("lat") ?? ""), "Vĩ độ (lat)");
  if (latResult.error) return { ok: false, error: latResult.error };
  const lngResult = parseOptionalNumber(String(formData.get("lng") ?? ""), "Kinh độ (lng)");
  if (lngResult.error) return { ok: false, error: lngResult.error };
  const lat = latResult.value;
  const lng = lngResult.value;

  const slug = slugify(name);

  const { data: project, error } = await supabaseServer
    .from("projects")
    .insert({
      slug,
      province_slug: provinceSlug,
      name,
      province,
      district: district || null,
      sales_status: salesStatus,
      // LUÔN "draft" khi tạo mới — publish là bước duyệt riêng (D3b).
      publication_status: "draft",
      updated_at: new Date().toISOString().slice(0, 10),
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Đã có dự án khác dùng slug này trong cùng tỉnh — đổi tên hoặc sửa dự án đã có." };
    }
    return { ok: false, error: error.message };
  }

  if (lat !== undefined || lng !== undefined) {
    const { error: locationError } = await supabaseServer
      .from("project_location")
      .insert({ project_id: project.id, lat: lat ?? null, lng: lng ?? null });
    if (locationError) {
      return { ok: true, projectId: project.id, warning: `Đã lưu dự án nhưng lưu toạ độ thất bại: ${locationError.message}` };
    }
  }

  return { ok: true, projectId: project.id, warning: coordOutOfRangeWarning(lat, lng) };
}

// ============================================================
// updateProject — D3a
// Sửa các field cốt lõi + giá + vị trí + 3 danh sách động (tiện ích, tiến độ,
// đối tượng phù hợp). KHÔNG đổi publication_status (xem D3b), KHÔNG đổi slug
// (slug là định danh URL công khai, không nằm trong form sửa).
// ============================================================

// Nhận đúng 1 tham số FormData (id nằm trong chính formData, field "id") — giống hệt cách gọi
// createProject(formData) đã chạy ổn định. Tránh truyền id tách rời khỏi FormData khi gọi Server
// Action trực tiếp từ client (không qua <form action>), vì đó là nguồn gây mất dữ liệu đã xác nhận
// qua debug log (xem lịch sử sửa D3a — updateProject(id, formData) 2 tham số).
export async function updateProject(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, error: "Thiếu id dự án." };

  const name = String(formData.get("name") ?? "").trim();
  const province = String(formData.get("province") ?? "").trim();
  const provinceSlug = String(formData.get("provinceSlug") ?? "").trim();
  const district = String(formData.get("district") ?? "").trim();
  const developer = String(formData.get("developer") ?? "").trim();
  const scale = String(formData.get("scale") ?? "").trim();
  const units = String(formData.get("units") ?? "").trim();
  const buildingDensity = String(formData.get("buildingDensity") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "").trim();
  const handoverExpected = String(formData.get("handoverExpected") ?? "").trim();
  const salesStatus = String(formData.get("salesStatus") ?? "");

  if (!name) return { ok: false, error: "Tên dự án không được để trống." };
  if (!province || !provinceSlug) return { ok: false, error: "Tỉnh/thành không được để trống." };
  if (!SALES_STATUSES.includes(salesStatus as SalesStatus)) {
    return { ok: false, error: "Trạng thái mở bán không hợp lệ." };
  }

  const latResult = parseOptionalNumber(String(formData.get("lat") ?? ""), "Vĩ độ (lat)");
  if (latResult.error) return { ok: false, error: latResult.error };
  const lngResult = parseOptionalNumber(String(formData.get("lng") ?? ""), "Kinh độ (lng)");
  if (lngResult.error) return { ok: false, error: lngResult.error };
  const lat = latResult.value;
  const lng = lngResult.value;

  const priceMinResult = parseOptionalNumber(String(formData.get("priceMin") ?? ""), "Giá thấp nhất");
  if (priceMinResult.error) return { ok: false, error: priceMinResult.error };
  const priceMaxResult = parseOptionalNumber(String(formData.get("priceMax") ?? ""), "Giá cao nhất");
  if (priceMaxResult.error) return { ok: false, error: priceMaxResult.error };

  const priceUnitRaw = String(formData.get("priceUnit") ?? "").trim();
  if (priceUnitRaw !== "" && !PRICE_UNITS.includes(priceUnitRaw as PriceUnit)) {
    return { ok: false, error: "Đơn vị giá không hợp lệ." };
  }
  const priceNote = String(formData.get("priceNote") ?? "").trim();

  const address = String(formData.get("address") ?? "").trim();
  const commuteNote = String(formData.get("commuteNote") ?? "").trim();

  // ---- Cập nhật hàng projects ----
  const { data: updatedRows, error: updateError } = await supabaseServer
    .from("projects")
    .update({
      name,
      province,
      province_slug: provinceSlug,
      district: district || null,
      developer: developer || null,
      scale: scale || null,
      units: units || null,
      building_density: buildingDensity || null,
      start_date: startDate || null,
      handover_expected: handoverExpected || null,
      sales_status: salesStatus,
      updated_at: new Date().toISOString().slice(0, 10),
    })
    .eq("id", id)
    .select("id");

  if (updateError) {
    if (updateError.code === "23505") {
      return { ok: false, error: "Đã có dự án khác dùng slug này trong cùng tỉnh." };
    }
    return { ok: false, error: updateError.message };
  }
  if (!updatedRows || updatedRows.length === 0) {
    return { ok: false, error: "Không tìm thấy dự án — có thể đã bị xoá." };
  }

  // ---- Giá + vị trí (1-1, upsert theo project_id) ----
  const [pricingRes, locationRes] = await Promise.all([
    supabaseServer.from("project_pricing").upsert(
      {
        project_id: id,
        price_min: priceMinResult.value ?? null,
        price_max: priceMaxResult.value ?? null,
        price_unit: priceUnitRaw || null,
        price_note: priceNote || null,
      },
      { onConflict: "project_id" }
    ),
    supabaseServer.from("project_location").upsert(
      {
        project_id: id,
        address: address || null,
        lat: lat ?? null,
        lng: lng ?? null,
        commute_note: commuteNote || null,
      },
      { onConflict: "project_id" }
    ),
  ]);
  if (pricingRes.error) return { ok: false, error: pricingRes.error.message };
  if (locationRes.error) return { ok: false, error: locationRes.error.message };

  // ---- 3 danh sách động — bỏ qua dòng thiếu field bắt buộc thay vì chặn cả form ----
  interface AmenityInput {
    icon?: string;
    name?: string;
    description?: string;
  }
  const amenityRows = (parseJsonArray(formData.get("amenitiesJson")) as AmenityInput[])
    .filter((a) => (a.name ?? "").trim() !== "")
    .map((a) => ({
      project_id: id,
      icon: AMENITY_ICONS.includes((a.icon ?? "") as AmenityIcon) ? a.icon : "default",
      name: (a.name ?? "").trim(),
      description: (a.description ?? "").trim() || null,
    }));

  interface TimelineInput {
    label?: string;
    date?: string;
    done?: boolean;
  }
  const timelineRows = (parseJsonArray(formData.get("timelineJson")) as TimelineInput[])
    .filter((t) => (t.label ?? "").trim() !== "" && (t.date ?? "").trim() !== "")
    .map((t, index) => ({
      project_id: id,
      label: (t.label ?? "").trim(),
      date: (t.date ?? "").trim(),
      done: Boolean(t.done),
      sort_order: index,
    }));

  interface FitForInput {
    text?: string;
    caution?: boolean;
  }
  const fitForRows = (parseJsonArray(formData.get("fitForJson")) as FitForInput[])
    .filter((f) => (f.text ?? "").trim() !== "")
    .map((f, index) => ({
      project_id: id,
      text: (f.text ?? "").trim(),
      caution: Boolean(f.caution),
      sort_order: index,
    }));

  const [amenitiesError, timelineError, fitForError] = await Promise.all([
    replaceChildRows("project_amenities", id, amenityRows),
    replaceChildRows("project_timeline", id, timelineRows),
    replaceChildRows("project_fit_for", id, fitForRows),
  ]);
  const childError = amenitiesError ?? timelineError ?? fitForError;
  if (childError) return { ok: false, error: childError };

  return { ok: true, projectId: id, warning: coordOutOfRangeWarning(lat, lng) };
}

// ============================================================
// publishProject — D3b
// publish: bắt buộc đủ field cốt lõi + ít nhất 4/7 phần nội dung có dữ liệu thật.
// unpublish: luôn cho phép (đưa dự án đã published quay lại draft không có rủi ro dữ liệu mỏng).
// ============================================================

const MIN_CONTENT_SECTIONS = 4;

interface ContentCheckItem {
  label: string;
  hasData: boolean;
}

function checkContentSections(project: ProjectWithTier): ContentCheckItem[] {
  return [
    { label: "Tiện ích", hasData: hasAmenitiesData(project) },
    { label: "Giá", hasData: hasPricingData(project) },
    { label: "Tiến độ", hasData: project.timeline.length > 0 },
    { label: "Đối tượng phù hợp", hasData: project.fitFor.length > 0 },
    {
      label: "Vị trí",
      hasData: Boolean(
        project.location.address || project.location.lat !== undefined || project.location.lng !== undefined || project.location.commuteNote
      ),
    },
    { label: "Ảnh", hasData: project.media.heroImage !== null },
    { label: "Quy mô", hasData: Boolean(project.scale || project.units) },
  ];
}

export async function publishProject(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim();
  const action = String(formData.get("action") ?? "");
  if (!id) return { ok: false, error: "Thiếu id dự án." };
  if (action !== "publish" && action !== "unpublish") {
    return { ok: false, error: "Hành động không hợp lệ." };
  }

  if (action === "unpublish") {
    const { error } = await supabaseServer.from("projects").update({ publication_status: "draft" }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    return { ok: true, projectId: id };
  }

  // ---- action === "publish" ----
  const { data: row, error: fetchError } = await supabaseServer.from("projects").select("*").eq("id", id).maybeSingle();
  if (fetchError) return { ok: false, error: fetchError.message };
  if (!row) return { ok: false, error: "Không tìm thấy dự án." };

  const [project] = await assembleProjects([row as ProjectRow]);
  if (!project) return { ok: false, error: "Không dựng được dữ liệu dự án." };

  const requiredMissing: string[] = [];
  if (!project.name) requiredMissing.push("Tên dự án");
  if (!project.province) requiredMissing.push("Tỉnh/thành");
  if (!project.salesStatus) requiredMissing.push("Trạng thái mở bán");
  if (!project.updatedAt) requiredMissing.push("Ngày cập nhật");
  if (requiredMissing.length > 0) {
    return { ok: false, error: `Thiếu thông tin bắt buộc: ${requiredMissing.join(", ")}.` };
  }

  const items = checkContentSections(project);
  const satisfied = items.filter((i) => i.hasData);
  const missing = items.filter((i) => !i.hasData);

  if (satisfied.length < MIN_CONTENT_SECTIONS) {
    const needMore = MIN_CONTENT_SECTIONS - satisfied.length;
    const haveLabel = satisfied.length > 0 ? satisfied.map((i) => i.label).join(", ") : "chưa có phần nào";
    const missingLabel = missing.map((i) => i.label).join(", ");
    return {
      ok: false,
      error: `Cần thêm ít nhất ${needMore} phần nữa: hiện có ${haveLabel} — còn thiếu ${missingLabel}.`,
    };
  }

  const { error: updateError } = await supabaseServer
    .from("projects")
    .update({ publication_status: "published", updated_at: new Date().toISOString().slice(0, 10) })
    .eq("id", id);
  if (updateError) return { ok: false, error: updateError.message };

  return { ok: true, projectId: id };
}

// ============================================================
// findNearbyAmenities — E2
// Quét tiện ích lân cận qua Overpass API (OSM), thay toàn bộ project_nearby_amenities
// của dự án, tự tính commuteNote qua distanceToProvinceCenter và lưu vào project_location.
// ============================================================

export interface FindNearbyAmenitiesResult {
  ok: boolean;
  error?: string;
  amenities?: NearbyAmenity[];
  commuteNote?: string;
}

export async function findNearbyAmenities(projectId: string): Promise<FindNearbyAmenitiesResult> {
  if (!projectId) return { ok: false, error: "Thiếu id dự án." };

  const [{ data: locationRow, error: locationError }, { data: projectRow, error: projectError }] = await Promise.all([
    supabaseServer.from("project_location").select("lat, lng").eq("project_id", projectId).maybeSingle(),
    supabaseServer.from("projects").select("province, province_slug").eq("id", projectId).maybeSingle(),
  ]);

  if (locationError) return { ok: false, error: locationError.message };
  if (projectError) return { ok: false, error: projectError.message };
  if (!projectRow) return { ok: false, error: "Không tìm thấy dự án." };
  if (!locationRow || locationRow.lat === null || locationRow.lng === null) {
    return { ok: false, error: "Dự án chưa có toạ độ (lat/lng) hợp lệ — lưu toạ độ trước khi quét." };
  }

  const lat = locationRow.lat as number;
  const lng = locationRow.lng as number;

  let amenities: NearbyAmenity[];
  try {
    amenities = await fetchNearbyAmenities(lat, lng);
  } catch (e) {
    return { ok: false, error: `Lỗi khi gọi Overpass API: ${e instanceof Error ? e.message : String(e)}` };
  }

  const { error: deleteError } = await supabaseServer
    .from("project_nearby_amenities")
    .delete()
    .eq("project_id", projectId);
  if (deleteError) return { ok: false, error: deleteError.message };

  if (amenities.length > 0) {
    const { error: insertError } = await supabaseServer.from("project_nearby_amenities").insert(
      amenities.map((a) => ({
        project_id: projectId,
        category: a.category,
        name: a.name,
        distance_meters: a.distanceMeters,
        within_project: false,
      }))
    );
    if (insertError) return { ok: false, error: insertError.message };
  }

  let commuteNote: string | undefined;
  const distanceToCenter = distanceToProvinceCenter(lat, lng, projectRow.province_slug);
  if (distanceToCenter !== null) {
    const km = (distanceToCenter / 1000).toFixed(1);
    commuteNote = `Cách trung tâm ${projectRow.province} khoảng ${km} km.`;
    const { error: updateLocationError } = await supabaseServer
      .from("project_location")
      .update({ commute_note: commuteNote })
      .eq("project_id", projectId);
    if (updateLocationError) return { ok: false, error: updateLocationError.message };
  }

  // Ghi log — miễn phí (cost = 0) nhưng vẫn theo dõi đã quét dự án nào, khi nào (E1).
  await recordApiUsage("osm_overpass", projectId, 0);

  return { ok: true, amenities, commuteNote };
}
