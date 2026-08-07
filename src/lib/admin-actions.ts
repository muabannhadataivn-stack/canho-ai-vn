"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "./supabase-server";
import { assembleProjects } from "./data-source";
import { applyWatermark } from "./image-watermark";
import { slugify } from "./slug";
import { VN_LAT_RANGE, VN_LNG_RANGE } from "./admin-constants";
import type { ProjectRow } from "./supabase-mapping";
import { hasAmenitiesData } from "@/components/project/AmenitiesSection";
import { hasPricingData } from "@/components/project/PricingTable";
import { fetchNearbyAmenities } from "./osm-places";
import { distanceToProvinceCenter } from "./distance";
import { recordApiUsage } from "./api-budget";
import { generateProjectContent, AI_CONTENT_MODEL } from "./ai-content";
import { containsBannedKeyword } from "./banned-keywords";
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

// ---- Ảnh dự án (hero image + gallery) — dùng CHUNG bucket Storage "project-images" ----
// Bucket + policy tạo qua migration 20260808000000_project_images_storage.sql — public đọc,
// authenticated ghi (dù Server Action này dùng service_role nên bỏ qua RLS, policy chỉ là
// lớp phòng thủ cho sau này). Giới hạn loại file + kích thước validate lại ở đây (server-side)
// dù client (EditProjectForm.tsx) đã chặn trước — không tin tưởng hoàn toàn validate phía client.
const PROJECT_IMAGE_BUCKET = "project-images";
const PROJECT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const PROJECT_IMAGE_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// public URL Supabase Storage có dạng .../object/public/{bucket}/{path} — cắt lấy đúng phần
// {path} để gọi .remove() dọn file cũ/đã xoá.
function extractStoragePath(publicUrl: string): string | null {
  const marker = `/object/public/${PROJECT_IMAGE_BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  return idx === -1 ? null : publicUrl.slice(idx + marker.length);
}

// revalidatePath trang công khai CHỈ khi dự án đang published — dùng chung bởi
// saveGalleryImages(), deleteGalleryImage(), setCoverImage() để không lặp lại cùng 1 query.
async function revalidatePublicPageIfPublished(projectId: string): Promise<void> {
  const { data: projectRow } = await supabaseServer
    .from("projects")
    .select("province_slug, slug, publication_status")
    .eq("id", projectId)
    .maybeSingle();
  if (projectRow?.publication_status === "published") {
    revalidatePath(`/${projectRow.province_slug}/${projectRow.slug}`);
  }
}

// ============================================================
// saveGalleryImages / deleteGalleryImage / setCoverImage — Album ảnh dự án (project_images)
// Gộp khái niệm "ảnh đại diện" (hero, project_media cũ) vào đây — ảnh bìa giờ chỉ là 1 ảnh
// trong album được đánh dấu is_cover=true (xem setCoverImage() + supabase-mapping.ts). Upload/
// xoá/đặt bìa đều tức thời từng thao tác, không gộp vào FormData của "Lưu thay đổi".
// từng thao tác (KHÔNG gộp vào FormData của "Lưu thay đổi" như amenities/timeline/fitFor) —
// khớp cách handleFindNearbyAmenities/handlePublishToggle/handleDelete đã hoạt động trong
// EditProjectForm.tsx: bấm là chạy ngay, không đợi submit cả form.
// ============================================================

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  isCover: boolean;
}

export interface SaveGalleryImagesResult {
  ok: boolean;
  error?: string;
  warning?: string;
  images?: GalleryImage[];
}

export async function saveGalleryImages(projectId: string, formData: FormData): Promise<SaveGalleryImagesResult> {
  if (!projectId) return { ok: false, error: "Thiếu id dự án." };

  const files = formData.getAll("galleryFiles").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { ok: false, error: "Chưa chọn ảnh nào." };

  // Nối vào CUỐI danh sách ảnh hiện có — không ghi đè thứ tự ảnh đã có sẵn.
  const { count: existingCount } = await supabaseServer
    .from("project_images")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);
  let nextSortOrder = existingCount ?? 0;

  const inserted: GalleryImage[] = [];
  const perFileErrors: string[] = [];

  for (const file of files) {
    if (!PROJECT_IMAGE_ALLOWED_TYPES.includes(file.type)) {
      perFileErrors.push(`${file.name}: phải là JPG, PNG hoặc WEBP.`);
      continue;
    }
    if (file.size > PROJECT_IMAGE_MAX_BYTES) {
      perFileErrors.push(`${file.name}: vượt quá 5MB.`);
      continue;
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    // Path riêng "gallery/" để phân biệt hoàn toàn với ảnh đại diện cũ trong cùng bucket.
    const path = `${projectId}/gallery/${Date.now()}-${safeName}`;
    const { buffer, contentType } = await applyWatermark(file);
    const { error: uploadError } = await supabaseServer.storage
      .from(PROJECT_IMAGE_BUCKET)
      .upload(path, buffer, { contentType, upsert: false });
    if (uploadError) {
      perFileErrors.push(`${file.name}: upload thất bại (${uploadError.message}).`);
      continue;
    }

    const { data: publicUrlData } = supabaseServer.storage.from(PROJECT_IMAGE_BUCKET).getPublicUrl(path);
    const { data: row, error: insertError } = await supabaseServer
      .from("project_images")
      .insert({ project_id: projectId, image_url: publicUrlData.publicUrl, sort_order: nextSortOrder })
      .select("id, image_url, image_alt, is_cover")
      .single();
    if (insertError || !row) {
      perFileErrors.push(`${file.name}: lưu vào cơ sở dữ liệu thất bại.`);
      continue;
    }

    nextSortOrder += 1;
    inserted.push({ id: row.id, url: row.image_url, alt: row.image_alt ?? "", isCover: row.is_cover });
  }

  if (inserted.length === 0) {
    return { ok: false, error: perFileErrors.join(" ") || "Upload thất bại." };
  }

  revalidatePath(`/admin/du-an/${projectId}`);
  await revalidatePublicPageIfPublished(projectId);

  return { ok: true, images: inserted, warning: perFileErrors.length > 0 ? perFileErrors.join(" ") : undefined };
}

export async function deleteGalleryImage(imageId: string): Promise<ActionResult> {
  if (!imageId) return { ok: false, error: "Thiếu id ảnh." };

  const { data: row, error: fetchError } = await supabaseServer
    .from("project_images")
    .select("project_id, image_url")
    .eq("id", imageId)
    .maybeSingle();
  if (fetchError) return { ok: false, error: fetchError.message };
  if (!row) return { ok: false, error: "Không tìm thấy ảnh — có thể đã bị xoá." };

  const storagePath = extractStoragePath(row.image_url);
  if (storagePath) await supabaseServer.storage.from(PROJECT_IMAGE_BUCKET).remove([storagePath]);

  const { error: deleteError } = await supabaseServer.from("project_images").delete().eq("id", imageId);
  if (deleteError) return { ok: false, error: deleteError.message };

  revalidatePath(`/admin/du-an/${row.project_id}`);
  await revalidatePublicPageIfPublished(row.project_id);

  return { ok: true, projectId: row.project_id };
}

// Đặt 1 ảnh làm ảnh bìa — set is_cover=false cho MỌI ảnh khác cùng dự án trước, rồi true cho
// đúng ảnh được chọn, đảm bảo luôn tối đa 1 ảnh bìa/dự án tại 1 thời điểm.
export async function setCoverImage(imageId: string): Promise<ActionResult> {
  if (!imageId) return { ok: false, error: "Thiếu id ảnh." };

  const { data: row, error: fetchError } = await supabaseServer
    .from("project_images")
    .select("project_id")
    .eq("id", imageId)
    .maybeSingle();
  if (fetchError) return { ok: false, error: fetchError.message };
  if (!row) return { ok: false, error: "Không tìm thấy ảnh — có thể đã bị xoá." };

  const { error: clearError } = await supabaseServer
    .from("project_images")
    .update({ is_cover: false })
    .eq("project_id", row.project_id);
  if (clearError) return { ok: false, error: clearError.message };

  const { error: setError } = await supabaseServer.from("project_images").update({ is_cover: true }).eq("id", imageId);
  if (setError) return { ok: false, error: setError.message };

  revalidatePath(`/admin/du-an/${row.project_id}`);
  await revalidatePublicPageIfPublished(row.project_id);

  return { ok: true, projectId: row.project_id };
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
      revalidatePath("/admin/du-an");
      return { ok: true, projectId: project.id, warning: `Đã lưu dự án nhưng lưu toạ độ thất bại: ${locationError.message}` };
    }
  }

  revalidatePath("/admin/du-an");
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
  const newAdministrativeArea = String(formData.get("newAdministrativeArea") ?? "").trim();

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
    .select("id, slug, publication_status");

  if (updateError) {
    if (updateError.code === "23505") {
      return { ok: false, error: "Đã có dự án khác dùng slug này trong cùng tỉnh." };
    }
    return { ok: false, error: updateError.message };
  }
  if (!updatedRows || updatedRows.length === 0) {
    return { ok: false, error: "Không tìm thấy dự án — có thể đã bị xoá." };
  }
  const updatedRow = updatedRows[0]!;

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
        new_administrative_area: newAdministrativeArea || null,
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

  // Ảnh đại diện KHÔNG còn xử lý ở đây — đã gộp vào Album ảnh dự án (project_images), quản lý
  // riêng qua saveGalleryImages()/deleteGalleryImage()/setCoverImage() (tức thời, không gộp
  // vào "Lưu thay đổi" của form này).

  // Bắt buộc — nếu không, Router Cache phía client (điều hướng mềm qua Link/router.push,
  // KHÔNG liên quan gì tới force-dynamic ở page.tsx) có thể phục vụ lại đúng RSC payload
  // của /admin/du-an/[id] từ TRƯỚC lần lưu này. Hậu quả không chỉ là hiển thị sai — nếu admin
  // sửa tiếp trên form đang mang dữ liệu cache cũ rồi lưu lần nữa, sẽ GHI ĐÈ MẤT chính những
  // gì vừa lưu thành công (đã xảy ra thật, xác nhận qua log ngày hôm nay).
  revalidatePath(`/admin/du-an/${id}`);
  revalidatePath("/admin/du-an");

  // THIẾU TỪ TRƯỚC — updateProject() chưa từng revalidate trang công khai, nên sửa dữ liệu
  // (VD ngày khởi công, trạng thái mở bán) trên 1 dự án ĐÃ publish không bao giờ cập nhật lên
  // trang tĩnh /{tinh}/{slug} (SSG) cho tới lần build/deploy kế tiếp — đã xác nhận là nguyên
  // nhân thật (không phải path /can-ho/ cũ như nghi ngờ ban đầu, grep xác nhận không còn sót).
  if (updatedRow.publication_status === "published") {
    revalidatePath(`/${provinceSlug}/${updatedRow.slug}`);
  }

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
    const { data: unpublishedRows, error } = await supabaseServer
      .from("projects")
      .update({ publication_status: "draft" })
      .eq("id", id)
      .select("province_slug, slug");
    if (error) return { ok: false, error: error.message };
    revalidatePath(`/admin/du-an/${id}`);
    revalidatePath("/admin/du-an");
    // Cùng bug đã xác nhận với updateProject() — thiếu dòng này thì trang công khai vẫn
    // hiện nội dung cũ (đã published) dù DB đã chuyển về draft, tới tận lần build/deploy sau.
    const unpublishedRow = unpublishedRows?.[0];
    if (unpublishedRow) revalidatePath(`/${unpublishedRow.province_slug}/${unpublishedRow.slug}`);
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

  // ---- Nội dung AI (F1) — chỉ sinh nếu CHƯA có, tái dùng nếu đã có (đỡ tốn phí, tránh
  // nội dung đổi mỗi lần unpublish/publish lại) ----
  const { data: existingAiContent, error: aiCheckError } = await supabaseServer
    .from("project_ai_content")
    .select("id")
    .eq("project_id", id)
    .limit(1);
  if (aiCheckError) return { ok: false, error: aiCheckError.message };

  if (!existingAiContent || existingAiContent.length === 0) {
    let generated;
    try {
      generated = await generateProjectContent(project);
    } catch (e) {
      return { ok: false, error: `Sinh nội dung AI thất bại: ${e instanceof Error ? e.message : String(e)}` };
    }

    const flaggedTexts = [generated.introText, ...generated.faq.map((f) => f.answer)];
    if (flaggedTexts.some((text) => containsBannedKeyword(text))) {
      // KHÔNG liệt kê từ nào bị dính trong lỗi trả cho admin — chỉ ghi log phía server.
      console.error(`[publishProject] Nội dung AI cho dự án ${id} chứa từ khoá không được phép — chặn publish.`);
      return {
        ok: false,
        error: "Nội dung AI sinh ra chứa từ khoá không được phép, vui lòng thử lại hoặc liên hệ hỗ trợ.",
      };
    }

    const { error: insertAiError } = await supabaseServer.from("project_ai_content").insert({
      project_id: id,
      intro_text: generated.introText,
      faq_json: generated.faq,
      model_version: AI_CONTENT_MODEL,
    });
    if (insertAiError) return { ok: false, error: insertAiError.message };
  }

  const { error: updateError } = await supabaseServer
    .from("projects")
    .update({ publication_status: "published", updated_at: new Date().toISOString().slice(0, 10) })
    .eq("id", id);
  if (updateError) return { ok: false, error: updateError.message };

  revalidatePath(`/admin/du-an/${id}`);
  revalidatePath("/admin/du-an");
  // Cùng bug đã xác nhận với updateProject() — dự án vừa published lần đầu (hoặc publish
  // lại) phải revalidate ngay trang công khai, không đợi build/deploy sau mới thấy.
  revalidatePath(`/${project.provinceSlug}/${project.slug}`);
  return { ok: true, projectId: id };
}

// ============================================================
// regenerateProjectContent — F1 fix
// Sinh lại nội dung AI theo dữ liệu MỚI NHẤT của dự án (Giá/Tiến độ/Quy mô... vừa sửa) —
// admin chủ động bấm khi cần, KHÔNG tự động chạy lúc publish (publishProject() không đổi,
// vẫn chỉ sinh nếu chưa từng có, xem comment ở đó). INSERT record mới thay vì update-in-place
// — đúng thiết kế append-only của project_ai_content (xem migration 20260804000000_init.sql:
// "mỗi lần sinh lại là 1 dòng mới... bản hiện hành là dòng có generated_at mới nhất"), tận
// dụng nguyên logic đọc đã có ở getProjectAiContent() (data-source.ts) mà không cần sửa gì.
// ============================================================

export async function regenerateProjectContent(projectId: string): Promise<ActionResult> {
  if (!projectId) return { ok: false, error: "Thiếu id dự án." };

  const { data: existing, error: existingError } = await supabaseServer
    .from("project_ai_content")
    .select("id")
    .eq("project_id", projectId)
    .limit(1);
  if (existingError) return { ok: false, error: existingError.message };
  if (!existing || existing.length === 0) {
    return { ok: false, error: "Dự án chưa từng có nội dung AI — publish lần đầu trước khi sinh lại." };
  }

  const { data: row, error: fetchError } = await supabaseServer.from("projects").select("*").eq("id", projectId).maybeSingle();
  if (fetchError) return { ok: false, error: fetchError.message };
  if (!row) return { ok: false, error: "Không tìm thấy dự án." };

  const [project] = await assembleProjects([row as ProjectRow]);
  if (!project) return { ok: false, error: "Không dựng được dữ liệu dự án." };

  let generated;
  try {
    generated = await generateProjectContent(project);
  } catch (e) {
    return { ok: false, error: `Sinh nội dung AI thất bại: ${e instanceof Error ? e.message : String(e)}` };
  }

  const flaggedTexts = [generated.introText, ...generated.faq.map((f) => f.answer)];
  if (flaggedTexts.some((text) => containsBannedKeyword(text))) {
    // KHÔNG liệt kê từ nào bị dính trong lỗi trả cho admin — chỉ ghi log phía server, giống publishProject().
    console.error(`[regenerateProjectContent] Nội dung AI cho dự án ${projectId} chứa từ khoá không được phép — chặn ghi.`);
    return {
      ok: false,
      error: "Nội dung AI sinh ra chứa từ khoá không được phép, vui lòng thử lại hoặc liên hệ hỗ trợ.",
    };
  }

  const { error: insertAiError } = await supabaseServer.from("project_ai_content").insert({
    project_id: projectId,
    intro_text: generated.introText,
    faq_json: generated.faq,
    model_version: AI_CONTENT_MODEL,
  });
  if (insertAiError) return { ok: false, error: insertAiError.message };

  revalidatePath(`/admin/du-an/${projectId}`);
  revalidatePath("/admin/du-an");
  if (project.publicationStatus === "published") {
    revalidatePath(`/${project.provinceSlug}/${project.slug}`);
  }
  return { ok: true, projectId };
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
    supabaseServer.from("projects").select("province, province_slug, slug, publication_status").eq("id", projectId).maybeSingle(),
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

  revalidatePath(`/admin/du-an/${projectId}`);
  // Cùng bug đã xác nhận với updateProject() — quét lại tiện ích lân cận/ghi chú di chuyển
  // trên 1 dự án ĐÃ publish cũng phải revalidate trang công khai, không chỉ trang admin.
  if (projectRow.publication_status === "published") {
    revalidatePath(`/${projectRow.province_slug}/${projectRow.slug}`);
  }
  return { ok: true, amenities, commuteNote };
}

// ============================================================
// deleteProject — D4
// "on delete cascade" đã có sẵn trên mọi bảng con tham chiếu projects(id) (xem
// supabase/migrations/20260804000000_init.sql) — chỉ cần xoá hàng projects, DB tự xoá
// theo project_pricing/project_amenities/project_nearby_amenities/project_timeline/
// project_location/project_fit_for/project_ai_content/project_price_history.
// Không thể hoàn tác — nơi gọi (client) BẮT BUỘC window.confirm() trước khi gọi action này.
// ============================================================

export async function deleteProject(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, error: "Thiếu id dự án." };

  // .select("id") sau delete() để BIẾT CHẮC có dòng nào thực sự bị xoá — DELETE khớp 0 dòng
  // (id sai/không tồn tại) là no-op hợp lệ về SQL/REST, KHÔNG trả lỗi, nên nếu không kiểm tra
  // riêng sẽ báo "thành công" giả dù không xoá được gì.
  const { data, error } = await supabaseServer
    .from("projects")
    .delete()
    .eq("id", id)
    .select("id, province_slug, slug, publication_status");
  if (error) return { ok: false, error: error.message };
  if (!data || data.length === 0) {
    return { ok: false, error: "Không tìm thấy dự án để xoá — có thể đã bị xoá từ trước." };
  }

  revalidatePath("/admin/du-an");
  // Cùng bug đã xác nhận với updateProject() — nếu dự án vừa xoá ĐANG published, trang công
  // khai vẫn phục vụ bản HTML tĩnh cũ (dự án "đã xoá" nhưng vẫn xem được) tới tận lần
  // build/deploy sau nếu không revalidate ngay ở đây.
  const deletedRow = data[0]!;
  if (deletedRow.publication_status === "published") {
    revalidatePath(`/${deletedRow.province_slug}/${deletedRow.slug}`);
  }
  return { ok: true, projectId: id };
}
