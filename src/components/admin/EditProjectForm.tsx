"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { updateProject, publishProject, findNearbyAmenities } from "@/lib/admin-actions";
import {
  PROVINCES,
  SALES_STATUS_OPTIONS,
  PRICE_UNIT_OPTIONS,
  AMENITY_ICON_OPTIONS,
  VN_LAT_RANGE,
  VN_LNG_RANGE,
} from "@/lib/admin-constants";
import { CATEGORY_LABEL as NEARBY_CATEGORY_LABEL } from "@/components/project/AmenitiesSection";
import type { AmenityIcon, NearbyAmenity, NearbyCategory, PriceUnit, ProjectWithTier, SalesStatus } from "@/lib/types";

interface AmenityRow {
  icon: AmenityIcon;
  name: string;
  description: string;
}
interface TimelineRow {
  label: string;
  date: string;
  done: boolean;
}
interface FitForRow {
  text: string;
  caution: boolean;
}

const inputClass =
  "w-full rounded-xl border border-line bg-paper px-3 py-2 text-[14px] text-ink outline-none focus:border-blueprint";
const labelClass = "mb-1 block text-[13px] font-medium text-graphite";

export function EditProjectForm({ project }: { project: ProjectWithTier }) {
  const router = useRouter();

  // Thông tin cốt lõi
  const [name, setName] = useState(project.name);
  const [provinceSlug, setProvinceSlug] = useState(project.provinceSlug);
  const [district, setDistrict] = useState(project.district ?? "");
  const [developer, setDeveloper] = useState(project.developer ?? "");
  const [scale, setScale] = useState(project.scale ?? "");
  const [units, setUnits] = useState(project.units ?? "");
  const [buildingDensity, setBuildingDensity] = useState(project.buildingDensity ?? "");
  const [startDate, setStartDate] = useState(project.startDate ?? "");
  const [handoverExpected, setHandoverExpected] = useState(project.handoverExpected ?? "");
  const [salesStatus, setSalesStatus] = useState<SalesStatus>(project.salesStatus);

  // Giá
  const [priceMin, setPriceMin] = useState(project.pricing.priceMin?.toString() ?? "");
  const [priceMax, setPriceMax] = useState(project.pricing.priceMax?.toString() ?? "");
  const [priceUnit, setPriceUnit] = useState<PriceUnit | "">(project.pricing.priceUnit ?? "");
  const [priceNote, setPriceNote] = useState(project.pricing.priceNote ?? "");

  // Vị trí
  const [address, setAddress] = useState(project.location.address ?? "");
  const [lat, setLat] = useState(project.location.lat?.toString() ?? "");
  const [lng, setLng] = useState(project.location.lng?.toString() ?? "");
  const [commuteNote, setCommuteNote] = useState(project.location.commuteNote ?? "");

  // Danh sách động
  const [amenities, setAmenities] = useState<AmenityRow[]>(
    project.amenities.map((a) => ({ icon: a.icon, name: a.name, description: a.desc ?? "" }))
  );
  const [timeline, setTimeline] = useState<TimelineRow[]>(
    project.timeline.map((t) => ({ label: t.label, date: t.date, done: t.done }))
  );
  const [fitFor, setFitFor] = useState<FitForRow[]>(
    project.fitFor.map((f) => ({ text: f.text, caution: f.caution ?? false }))
  );

  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Trạng thái publish — tách state riêng để cập nhật badge/nút ngay sau khi publish/unpublish,
  // không cần F5.
  const [publicationStatus, setPublicationStatus] = useState(project.publicationStatus);
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);

  async function handlePublishToggle() {
    const nextAction = publicationStatus === "published" ? "unpublish" : "publish";
    setPublishLoading(true);
    setPublishError(null);
    setPublishMessage(null);

    const formData = new FormData();
    formData.set("id", project.id);
    formData.set("action", nextAction);

    const result = await publishProject(formData);
    setPublishLoading(false);

    if (!result.ok) {
      setPublishError(result.error ?? "Có lỗi xảy ra, thử lại.");
      return;
    }

    setPublicationStatus(nextAction === "publish" ? "published" : "draft");
    setPublishMessage(nextAction === "publish" ? "Đã publish dự án — hiện công khai." : "Đã gỡ khỏi publish — chuyển về draft.");
  }

  // Tìm tiện ích lân cận (OSM Overpass) — dùng toạ độ ĐÃ LƯU của dự án (project.location),
  // không dùng giá trị lat/lng đang gõ dở trong form nếu chưa bấm "Lưu thay đổi".
  const hasSavedCoords = project.location.lat !== undefined && project.location.lng !== undefined;
  const existingNearbyCount = project.nearbyAmenities.length;
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState<string | null>(null);
  const [nearbyResult, setNearbyResult] = useState<NearbyAmenity[] | null>(null);
  const [nearbyCommuteNote, setNearbyCommuteNote] = useState<string | null>(null);

  async function handleFindNearbyAmenities() {
    if (existingNearbyCount > 0) {
      const confirmed = window.confirm(
        `Đã có ${existingNearbyCount} tiện ích lân cận, quét lại sẽ thay thế toàn bộ — tiếp tục?`
      );
      if (!confirmed) return;
    }

    setNearbyLoading(true);
    setNearbyError(null);

    const result = await findNearbyAmenities(project.id);
    setNearbyLoading(false);

    if (!result.ok) {
      setNearbyError(result.error ?? "Có lỗi xảy ra, thử lại.");
      return;
    }

    setNearbyResult(result.amenities ?? []);
    if (result.commuteNote) {
      setNearbyCommuteNote(result.commuteNote);
      setCommuteNote(result.commuteNote); // đồng bộ vào field commuteNote của form, khớp DB vừa cập nhật
    }
  }

  const latNum = lat.trim() === "" ? undefined : Number(lat);
  const lngNum = lng.trim() === "" ? undefined : Number(lng);
  const latInvalid = lat.trim() !== "" && Number.isNaN(latNum);
  const lngInvalid = lng.trim() !== "" && Number.isNaN(lngNum);
  const latOutOfRange = latNum !== undefined && !Number.isNaN(latNum) && (latNum < VN_LAT_RANGE.min || latNum > VN_LAT_RANGE.max);
  const lngOutOfRange = lngNum !== undefined && !Number.isNaN(lngNum) && (lngNum < VN_LNG_RANGE.min || lngNum > VN_LNG_RANGE.max);
  const priceMinInvalid = priceMin.trim() !== "" && Number.isNaN(Number(priceMin));
  const priceMaxInvalid = priceMax.trim() !== "" && Number.isNaN(Number(priceMax));

  const canSubmit =
    name.trim() !== "" &&
    provinceSlug !== "" &&
    !latInvalid &&
    !lngInvalid &&
    !priceMinInvalid &&
    !priceMaxInvalid &&
    !loading;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setWarning(null);
    setLoading(true);

    const province = PROVINCES.find((p) => p.slug === provinceSlug);
    const formData = new FormData();
    formData.set("id", project.id);
    formData.set("name", name);
    formData.set("province", province?.name ?? "");
    formData.set("provinceSlug", provinceSlug);
    formData.set("district", district);
    formData.set("developer", developer);
    formData.set("scale", scale);
    formData.set("units", units);
    formData.set("buildingDensity", buildingDensity);
    formData.set("startDate", startDate);
    formData.set("handoverExpected", handoverExpected);
    formData.set("salesStatus", salesStatus);
    formData.set("priceMin", priceMin);
    formData.set("priceMax", priceMax);
    formData.set("priceUnit", priceUnit);
    formData.set("priceNote", priceNote);
    formData.set("address", address);
    formData.set("lat", lat);
    formData.set("lng", lng);
    formData.set("commuteNote", commuteNote);
    formData.set("amenitiesJson", JSON.stringify(amenities));
    formData.set("timelineJson", JSON.stringify(timeline));
    formData.set("fitForJson", JSON.stringify(fitFor));

    const result = await updateProject(formData);
    setLoading(false);

    if (!result.ok) {
      setError(result.error ?? "Có lỗi xảy ra, thử lại.");
      return;
    }
    if (result.warning) setWarning(result.warning);

    router.push("/admin/du-an");
    router.refresh();
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-5 flex items-center gap-3">
        <h1 className="font-display text-[19px] font-bold text-ink">Sửa dự án — {project.name}</h1>
        <span
          className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${
            publicationStatus === "published" ? "bg-green/15 text-green" : "bg-gold/15 text-gold-dark"
          }`}
        >
          {publicationStatus === "published" ? "Đã publish" : "Draft"}
        </span>
      </div>

      <div className="mb-5 rounded-2xl border-2 border-gold/40 bg-gold/5 p-4">
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <div>
            <div className="font-display text-[14px] font-bold text-ink">
              {publicationStatus === "published" ? "Dự án đang công khai" : "Dự án đang ở chế độ nháp"}
            </div>
            <p className="mt-0.5 text-[12.5px] text-graphite/60">
              {publicationStatus === "published"
                ? "Gỡ khỏi publish sẽ đưa dự án về draft — không xoá dữ liệu, chỉ ẩn khỏi trang công khai."
                : "Publish yêu cầu đủ thông tin bắt buộc và ít nhất 4/7 phần nội dung có dữ liệu."}
            </p>
          </div>
          <button
            type="button"
            onClick={handlePublishToggle}
            disabled={publishLoading}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-[13.5px] font-semibold transition-opacity disabled:opacity-60 ${
              publicationStatus === "published" ? "bg-red text-paper" : "bg-gold text-ink"
            }`}
          >
            {publishLoading
              ? "Đang xử lý..."
              : publicationStatus === "published"
                ? "Gỡ khỏi publish (chuyển về draft)"
                : "Publish dự án này"}
          </button>
        </div>
        {publishMessage && <p className="text-[13px] text-green">{publishMessage}</p>}
        {publishError && <p className="text-[13px] text-red">{publishError}</p>}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <details open className="rounded-2xl border border-line bg-white p-4">
          <summary className="cursor-pointer font-display text-[15px] font-bold text-ink">Thông tin cốt lõi</summary>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="col-span-2 block">
              <span className={labelClass}>Tên dự án *</span>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Tỉnh/thành *</span>
              <select required value={provinceSlug} onChange={(e) => setProvinceSlug(e.target.value)} className={inputClass}>
                {PROVINCES.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Quận/huyện</span>
              <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Chủ đầu tư</span>
              <input type="text" value={developer} onChange={(e) => setDeveloper(e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Trạng thái mở bán *</span>
              <select
                required
                value={salesStatus}
                onChange={(e) => setSalesStatus(e.target.value as SalesStatus)}
                className={inputClass}
              >
                {SALES_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Quy mô</span>
              <input type="text" value={scale} onChange={(e) => setScale(e.target.value)} placeholder="VD: 271 ha" className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Số toà</span>
              <input type="text" value={units} onChange={(e) => setUnits(e.target.value)} placeholder="VD: 51 toà" className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Mật độ xây dựng</span>
              <input
                type="text"
                value={buildingDensity}
                onChange={(e) => setBuildingDensity(e.target.value)}
                placeholder="VD: ≈ 22%"
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Khởi công</span>
              <input type="text" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="VD: Q2/2018" className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Bàn giao dự kiến</span>
              <input
                type="text"
                value={handoverExpected}
                onChange={(e) => setHandoverExpected(e.target.value)}
                placeholder="VD: Q3/2026"
                className={inputClass}
              />
            </label>
          </div>
        </details>

        <details className="rounded-2xl border border-line bg-white p-4">
          <summary className="cursor-pointer font-display text-[15px] font-bold text-ink">Giá</summary>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="block">
              <span className={labelClass}>Giá thấp nhất</span>
              <input type="text" inputMode="decimal" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className={inputClass} />
              {priceMinInvalid && <p className="mt-1 text-[12px] text-red">Không phải số hợp lệ.</p>}
            </label>
            <label className="block">
              <span className={labelClass}>Giá cao nhất</span>
              <input type="text" inputMode="decimal" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className={inputClass} />
              {priceMaxInvalid && <p className="mt-1 text-[12px] text-red">Không phải số hợp lệ.</p>}
            </label>
            <label className="block">
              <span className={labelClass}>Đơn vị giá</span>
              <select value={priceUnit} onChange={(e) => setPriceUnit(e.target.value as PriceUnit | "")} className={inputClass}>
                <option value="">— Chưa chọn —</option>
                {PRICE_UNIT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="col-span-2 block">
              <span className={labelClass}>Ghi chú giá</span>
              <input type="text" value={priceNote} onChange={(e) => setPriceNote(e.target.value)} className={inputClass} />
            </label>
          </div>
        </details>

        <details className="rounded-2xl border border-line bg-white p-4">
          <summary className="cursor-pointer font-display text-[15px] font-bold text-ink">Vị trí</summary>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="col-span-2 block">
              <span className={labelClass}>Địa chỉ</span>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Vĩ độ (lat)</span>
              <input
                type="text"
                inputMode="decimal"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="Lấy từ Chợ Cư Dân"
                className={inputClass}
              />
              {latInvalid && <p className="mt-1 text-[12px] text-red">Không phải số hợp lệ.</p>}
              {!latInvalid && latOutOfRange && <p className="mt-1 text-[12px] text-gold-dark">Ngoài khoảng VN thô — vẫn lưu được.</p>}
            </label>
            <label className="block">
              <span className={labelClass}>Kinh độ (lng)</span>
              <input
                type="text"
                inputMode="decimal"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="Lấy từ Chợ Cư Dân"
                className={inputClass}
              />
              {lngInvalid && <p className="mt-1 text-[12px] text-red">Không phải số hợp lệ.</p>}
              {!lngInvalid && lngOutOfRange && <p className="mt-1 text-[12px] text-gold-dark">Ngoài khoảng VN thô — vẫn lưu được.</p>}
            </label>
            <label className="col-span-2 block">
              <span className={labelClass}>Ghi chú di chuyển</span>
              <input type="text" value={commuteNote} onChange={(e) => setCommuteNote(e.target.value)} className={inputClass} />
            </label>
          </div>

          {hasSavedCoords && (
            <div className="col-span-2 mt-3 border-t border-line pt-3">
              <button
                type="button"
                onClick={handleFindNearbyAmenities}
                disabled={nearbyLoading}
                className="rounded-xl border border-line px-3.5 py-2 text-[13px] font-semibold text-ink hover:bg-paper-dim disabled:opacity-60"
              >
                {nearbyLoading ? "Đang quét OpenStreetMap..." : "Tìm tiện ích lân cận"}
              </button>
              <p className="mt-1 text-[11.5px] text-graphite/50">
                Dùng toạ độ đã lưu của dự án — nếu vừa sửa lat/lng ở trên, bấm &ldquo;Lưu thay đổi&rdquo; trước.
              </p>

              {nearbyError && <p className="mt-2 text-[13px] text-red">{nearbyError}</p>}

              {nearbyResult && (
                <div className="mt-3 rounded-xl border border-line bg-paper p-3 text-[13px]">
                  <div className="mb-2 font-semibold text-ink">Tìm được {nearbyResult.length} tiện ích lân cận:</div>
                  {nearbyResult.length === 0 ? (
                    <p className="text-graphite/60">Không tìm thấy tiện ích nào có tên trong bán kính quét.</p>
                  ) : (
                    (Object.keys(NEARBY_CATEGORY_LABEL) as NearbyCategory[]).map((cat) => {
                      const items = nearbyResult.filter((r) => r.category === cat);
                      if (items.length === 0) return null;
                      return (
                        <div key={cat} className="mb-2">
                          <div className="text-[12px] font-semibold text-blueprint">{NEARBY_CATEGORY_LABEL[cat]}</div>
                          {items.map((item) => (
                            <div key={item.name} className="flex justify-between gap-2 text-graphite">
                              <span>{item.name}</span>
                              <span className="shrink-0 font-mono text-[11.5px] text-graphite/50">{item.distanceMeters} m</span>
                            </div>
                          ))}
                        </div>
                      );
                    })
                  )}
                  {nearbyCommuteNote && (
                    <p className="mt-2 border-t border-line pt-2 text-[12px] text-graphite/60">
                      Ghi chú di chuyển đã tự cập nhật: {nearbyCommuteNote}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </details>

        <details className="rounded-2xl border border-line bg-white p-4">
          <summary className="cursor-pointer font-display text-[15px] font-bold text-ink">Tiện ích nội khu</summary>
          <div className="mt-4 flex flex-col gap-2.5">
            {amenities.map((row, i) => (
              <div key={i} className="grid grid-cols-[110px_1fr_1fr_auto] items-start gap-2">
                <select
                  value={row.icon}
                  onChange={(e) =>
                    setAmenities((rows) => rows.map((r, idx) => (idx === i ? { ...r, icon: e.target.value as AmenityIcon } : r)))
                  }
                  className={inputClass}
                >
                  {AMENITY_ICON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Tên tiện ích"
                  value={row.name}
                  onChange={(e) => setAmenities((rows) => rows.map((r, idx) => (idx === i ? { ...r, name: e.target.value } : r)))}
                  className={inputClass}
                />
                <input
                  type="text"
                  placeholder="Mô tả ngắn"
                  value={row.description}
                  onChange={(e) =>
                    setAmenities((rows) => rows.map((r, idx) => (idx === i ? { ...r, description: e.target.value } : r)))
                  }
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setAmenities((rows) => rows.filter((_, idx) => idx !== i))}
                  className="rounded-xl border border-line px-3 py-2 text-[13px] text-red"
                >
                  Xoá
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setAmenities((rows) => [...rows, { icon: "default", name: "", description: "" }])}
              className="self-start rounded-full border border-line px-3.5 py-1.5 text-[13px] font-medium text-graphite hover:bg-paper-dim"
            >
              + Thêm tiện ích
            </button>
          </div>
        </details>

        <details className="rounded-2xl border border-line bg-white p-4">
          <summary className="cursor-pointer font-display text-[15px] font-bold text-ink">Tiến độ</summary>
          <div className="mt-4 flex flex-col gap-2.5">
            {timeline.map((row, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-2">
                <input
                  type="text"
                  placeholder="Nhãn (VD: Khởi công)"
                  value={row.label}
                  onChange={(e) => setTimeline((rows) => rows.map((r, idx) => (idx === i ? { ...r, label: e.target.value } : r)))}
                  className={inputClass}
                />
                <input
                  type="text"
                  placeholder="Ngày (VD: Quý 2/2018)"
                  value={row.date}
                  onChange={(e) => setTimeline((rows) => rows.map((r, idx) => (idx === i ? { ...r, date: e.target.value } : r)))}
                  className={inputClass}
                />
                <label className="flex items-center gap-1.5 text-[13px] text-graphite">
                  <input
                    type="checkbox"
                    checked={row.done}
                    onChange={(e) => setTimeline((rows) => rows.map((r, idx) => (idx === i ? { ...r, done: e.target.checked } : r)))}
                  />
                  Done
                </label>
                <button
                  type="button"
                  onClick={() => setTimeline((rows) => rows.filter((_, idx) => idx !== i))}
                  className="rounded-xl border border-line px-3 py-2 text-[13px] text-red"
                >
                  Xoá
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setTimeline((rows) => [...rows, { label: "", date: "", done: false }])}
              className="self-start rounded-full border border-line px-3.5 py-1.5 text-[13px] font-medium text-graphite hover:bg-paper-dim"
            >
              + Thêm mốc tiến độ
            </button>
          </div>
        </details>

        <details className="rounded-2xl border border-line bg-white p-4">
          <summary className="cursor-pointer font-display text-[15px] font-bold text-ink">Đối tượng phù hợp</summary>
          <div className="mt-4 flex flex-col gap-2.5">
            {fitFor.map((row, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                <input
                  type="text"
                  placeholder="VD: Gia đình trẻ làm việc khu Đông"
                  value={row.text}
                  onChange={(e) => setFitFor((rows) => rows.map((r, idx) => (idx === i ? { ...r, text: e.target.value } : r)))}
                  className={inputClass}
                />
                <label className="flex items-center gap-1.5 text-[13px] text-graphite">
                  <input
                    type="checkbox"
                    checked={row.caution}
                    onChange={(e) => setFitFor((rows) => rows.map((r, idx) => (idx === i ? { ...r, caution: e.target.checked } : r)))}
                  />
                  Cân nhắc
                </label>
                <button
                  type="button"
                  onClick={() => setFitFor((rows) => rows.filter((_, idx) => idx !== i))}
                  className="rounded-xl border border-line px-3 py-2 text-[13px] text-red"
                >
                  Xoá
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFitFor((rows) => [...rows, { text: "", caution: false }])}
              className="self-start rounded-full border border-line px-3.5 py-1.5 text-[13px] font-medium text-graphite hover:bg-paper-dim"
            >
              + Thêm dòng
            </button>
          </div>
        </details>

        {warning && <p className="text-[13px] text-gold-dark">{warning}</p>}
        {error && <p className="text-[13px] text-red">{error}</p>}

        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-xl bg-ink px-4 py-2.5 text-[14px] font-semibold text-paper transition-opacity disabled:opacity-60"
        >
          {loading ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </form>
    </div>
  );
}
