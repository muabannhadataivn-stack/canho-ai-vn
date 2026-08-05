"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/lib/admin-actions";
import { PROVINCES, SALES_STATUS_OPTIONS, VN_LAT_RANGE, VN_LNG_RANGE } from "@/lib/admin-constants";
import type { SalesStatus } from "@/lib/types";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [provinceSlug, setProvinceSlug] = useState(PROVINCES[0]!.slug);
  const [district, setDistrict] = useState("");
  const [salesStatus, setSalesStatus] = useState<SalesStatus>("dang-cap-nhat");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const latNum = lat.trim() === "" ? undefined : Number(lat);
  const lngNum = lng.trim() === "" ? undefined : Number(lng);
  const latInvalid = lat.trim() !== "" && Number.isNaN(latNum);
  const lngInvalid = lng.trim() !== "" && Number.isNaN(lngNum);
  const latOutOfRange = latNum !== undefined && !Number.isNaN(latNum) && (latNum < VN_LAT_RANGE.min || latNum > VN_LAT_RANGE.max);
  const lngOutOfRange = lngNum !== undefined && !Number.isNaN(lngNum) && (lngNum < VN_LNG_RANGE.min || lngNum > VN_LNG_RANGE.max);
  const canSubmit = name.trim() !== "" && provinceSlug !== "" && !latInvalid && !lngInvalid && !loading;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setLoading(true);

    const province = PROVINCES.find((p) => p.slug === provinceSlug);
    const formData = new FormData();
    formData.set("name", name);
    formData.set("province", province?.name ?? "");
    formData.set("provinceSlug", provinceSlug);
    formData.set("district", district);
    formData.set("salesStatus", salesStatus);
    formData.set("lat", lat);
    formData.set("lng", lng);

    const result = await createProject(formData);
    setLoading(false);

    if (!result.ok) {
      setError(result.error ?? "Có lỗi xảy ra, thử lại.");
      return;
    }

    router.push("/admin/du-an");
    router.refresh();
  }

  return (
    <div className="max-w-lg">
      <h1 className="mb-5 font-display text-[19px] font-bold text-ink">Thêm dự án mới</h1>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-white p-6">
        <label className="mb-4 block">
          <span className="mb-1 block text-[13px] font-medium text-graphite">Tên dự án *</span>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-[14px] text-ink outline-none focus:border-blueprint"
          />
        </label>

        <label className="mb-4 block">
          <span className="mb-1 block text-[13px] font-medium text-graphite">Tỉnh/thành *</span>
          <select
            required
            value={provinceSlug}
            onChange={(e) => setProvinceSlug(e.target.value)}
            className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-[14px] text-ink outline-none focus:border-blueprint"
          >
            {PROVINCES.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <label className="mb-4 block">
          <span className="mb-1 block text-[13px] font-medium text-graphite">Quận/huyện (không bắt buộc)</span>
          <input
            type="text"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-[14px] text-ink outline-none focus:border-blueprint"
          />
        </label>

        <label className="mb-4 block">
          <span className="mb-1 block text-[13px] font-medium text-graphite">Trạng thái mở bán *</span>
          <select
            required
            value={salesStatus}
            onChange={(e) => setSalesStatus(e.target.value as SalesStatus)}
            className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-[14px] text-ink outline-none focus:border-blueprint"
          >
            {SALES_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-[13px] font-medium text-graphite">Vĩ độ (lat)</span>
            <input
              type="text"
              inputMode="decimal"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="Lấy từ Chợ Cư Dân"
              className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-[14px] text-ink outline-none focus:border-blueprint"
            />
            {latInvalid && <p className="mt-1 text-[12px] text-red">Không phải số hợp lệ.</p>}
            {!latInvalid && latOutOfRange && (
              <p className="mt-1 text-[12px] text-gold-dark">Ngoài khoảng VN thô (8–24) — vẫn lưu được.</p>
            )}
          </label>
          <label className="block">
            <span className="mb-1 block text-[13px] font-medium text-graphite">Kinh độ (lng)</span>
            <input
              type="text"
              inputMode="decimal"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="Lấy từ Chợ Cư Dân"
              className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-[14px] text-ink outline-none focus:border-blueprint"
            />
            {lngInvalid && <p className="mt-1 text-[12px] text-red">Không phải số hợp lệ.</p>}
            {!lngInvalid && lngOutOfRange && (
              <p className="mt-1 text-[12px] text-gold-dark">Ngoài khoảng VN thô (102–110) — vẫn lưu được.</p>
            )}
          </label>
        </div>

        <p className="mb-4 text-[12.5px] text-graphite/60">
          Dự án tạo mới luôn ở trạng thái <b>draft</b> — cần bước duyệt riêng để publish công khai.
        </p>

        {error && <p className="mb-4 text-[13px] text-red">{error}</p>}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-xl bg-ink px-4 py-2.5 text-[14px] font-semibold text-paper transition-opacity disabled:opacity-60"
        >
          {loading ? "Đang lưu..." : "Lưu dự án (draft)"}
        </button>
      </form>
    </div>
  );
}
