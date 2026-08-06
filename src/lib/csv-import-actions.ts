"use server";

import { parse } from "csv-parse/sync";
import { supabaseServer } from "./supabase-server";
import { slugify } from "./slug";
import { normalizeProvince, UNRESOLVED_PROVINCE } from "./province-normalize";
import { VN_LAT_RANGE, VN_LNG_RANGE } from "./admin-constants";

/**
 * Import hàng loạt dự án từ CSV export của Chợ Cư Dân (1 lần, thao tác thủ công qua
 * /admin/du-an/nhap-csv — KHÔNG phải cron/định kỳ). Cột CSV: id, name, slug, city,
 * district, lat, lng, verification_radius_meters, source_external_id, member_count,
 * has_bql_partnership, created_at, updated_at, market_data_url, coords_source,
 * coords_confidence — chỉ dùng name/slug/city/district/lat/lng, các cột còn lại
 * không có chỗ tương ứng trong schema hiện tại nên bỏ qua.
 */

const CHUNK_SIZE = 200;

interface PreparedImportRow {
  name: string;
  slug: string;
  provinceName: string;
  provinceSlug: string;
  provinceResolved: boolean;
  district: string | null;
  lat: number | null;
  lng: number | null;
}

function parseValidCoord(raw: string | undefined, range: { min: number; max: number }): number | null {
  if (!raw || raw.trim() === "") return null;
  const value = Number(raw);
  if (Number.isNaN(value)) return null;
  if (value < range.min || value > range.max) return null;
  return value;
}

// Không export — chỉ dùng nội bộ file này (file "use server" chỉ được export async function).
function prepareRowsFromCsv(csvText: string): PreparedImportRow[] {
  const records = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  const rows: PreparedImportRow[] = [];
  for (const row of records) {
    const name = (row.name ?? "").trim();
    if (!name) continue; // không có tên thì bỏ qua hẳn — không đủ dữ liệu tối thiểu để tạo dự án

    const slugSource = (row.slug ?? "").trim() || name;
    const normalized = normalizeProvince(row.city);
    const province = normalized ?? UNRESOLVED_PROVINCE;

    rows.push({
      name,
      slug: slugify(slugSource),
      provinceName: province.name,
      provinceSlug: province.slug,
      provinceResolved: normalized !== null,
      district: (row.district ?? "").trim() || null,
      lat: parseValidCoord(row.lat, VN_LAT_RANGE),
      lng: parseValidCoord(row.lng, VN_LNG_RANGE),
    });
  }
  return rows;
}

async function prepareRowsFromFormData(formData: FormData): Promise<PreparedImportRow[]> {
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);
  let rows: PreparedImportRow[] = [];
  for (const file of files) {
    const text = await file.text();
    rows = rows.concat(prepareRowsFromCsv(text));
  }
  return rows;
}

export interface CsvPreviewResult {
  ok: boolean;
  error?: string;
  total?: number;
  resolvedProvince?: number;
  unresolvedProvince?: number;
  duplicateInDb?: number;
}

/** Chỉ đọc + đối chiếu DB để thống kê — KHÔNG ghi gì vào DB. */
export async function previewCsvImport(formData: FormData): Promise<CsvPreviewResult> {
  const files = formData.getAll("files");
  if (files.length === 0) return { ok: false, error: "Chưa chọn file CSV nào." };

  let rows: PreparedImportRow[];
  try {
    rows = await prepareRowsFromFormData(formData);
  } catch (e) {
    return { ok: false, error: `Không đọc được file CSV: ${e instanceof Error ? e.message : String(e)}` };
  }

  const total = rows.length;
  const unresolvedProvince = rows.filter((r) => !r.provinceResolved).length;
  const resolvedProvince = total - unresolvedProvince;

  const { data: existing, error } = await supabaseServer.from("projects").select("province_slug, slug");
  if (error) return { ok: false, error: error.message };
  const existingKeys = new Set((existing ?? []).map((r) => `${r.province_slug}:${r.slug}`));
  const duplicateInDb = rows.filter((r) => existingKeys.has(`${r.provinceSlug}:${r.slug}`)).length;

  return { ok: true, total, resolvedProvince, unresolvedProvince, duplicateInDb };
}

export interface CsvImportResult {
  ok: boolean;
  error?: string;
  total?: number;
  imported?: number;
  skippedDuplicate?: number;
  unresolvedProvince?: number;
}

export async function importProjectsFromCsv(formData: FormData): Promise<CsvImportResult> {
  const files = formData.getAll("files");
  if (files.length === 0) return { ok: false, error: "Chưa chọn file CSV nào." };

  let rows: PreparedImportRow[];
  try {
    rows = await prepareRowsFromFormData(formData);
  } catch (e) {
    return { ok: false, error: `Không đọc được file CSV: ${e instanceof Error ? e.message : String(e)}` };
  }

  const total = rows.length;
  const unresolvedProvince = rows.filter((r) => !r.provinceResolved).length;
  const today = new Date().toISOString().slice(0, 10);

  let imported = 0;
  let skippedDuplicate = 0;

  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE);
    const insertPayload = chunk.map((r) => ({
      slug: r.slug,
      province_slug: r.provinceSlug,
      name: r.name,
      province: r.provinceName,
      district: r.district,
      sales_status: "dang-cap-nhat",
      publication_status: "draft",
      updated_at: today,
    }));

    // onConflict + ignoreDuplicates = INSERT ... ON CONFLICT (province_slug, slug) DO NOTHING —
    // bỏ qua dòng trùng thay vì lỗi cả lô. RETURNING chỉ trả về đúng các dòng THẬT SỰ được insert.
    const { data: insertedRows, error } = await supabaseServer
      .from("projects")
      .upsert(insertPayload, { onConflict: "province_slug,slug", ignoreDuplicates: true })
      .select("id, province_slug, slug");

    if (error) {
      return {
        ok: false,
        error: `Lỗi khi import (dòng ~${i + 1}–${i + chunk.length}): ${error.message}`,
        total,
        imported,
        skippedDuplicate,
        unresolvedProvince,
      };
    }

    const inserted = insertedRows ?? [];
    imported += inserted.length;
    skippedDuplicate += chunk.length - inserted.length;

    const locationPayload = inserted
      .map((row) => {
        const source = chunk.find((r) => r.provinceSlug === row.province_slug && r.slug === row.slug);
        if (!source || source.lat === null || source.lng === null) return null;
        return { project_id: row.id as string, lat: source.lat, lng: source.lng };
      })
      .filter((r): r is { project_id: string; lat: number; lng: number } => r !== null);

    if (locationPayload.length > 0) {
      const { error: locationError } = await supabaseServer.from("project_location").insert(locationPayload);
      if (locationError) {
        // Không rollback cả lô chỉ vì lưu toạ độ lỗi — dự án vẫn nằm trong DB dạng draft,
        // CTV bổ sung toạ độ sau qua form sửa (D3a).
        console.error("[importProjectsFromCsv] insert project_location thất bại:", locationError.message);
      }
    }
  }

  return { ok: true, total, imported, skippedDuplicate, unresolvedProvince };
}
