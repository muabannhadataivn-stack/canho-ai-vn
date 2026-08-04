"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SalesStatus } from "@/lib/types";
import { PRICE_TIER_LABEL } from "@/lib/price-tier";

interface Option<T extends string> {
  value: T;
  label: string;
}

const PROVINCE_OPTIONS: Option<string>[] = [
  { value: "tp-hcm", label: "TP.HCM" },
  { value: "ha-noi", label: "Hà Nội" },
  { value: "dong-nai", label: "Đồng Nai" },
  { value: "hung-yen", label: "Hưng Yên" },
];

const PRICE_OPTIONS: Option<string>[] = (Object.entries(PRICE_TIER_LABEL) as [string, string][]).map(
  ([value, label]) => ({ value, label })
);

const STATUS_OPTIONS: Option<SalesStatus>[] = [
  { value: "dang-mo-ban", label: "Đang mở bán" },
  { value: "sap-mo-ban", label: "Sắp mở bán" },
  { value: "da-ban-giao", label: "Đã bàn giao" },
];

export function FilterPanel({
  initialProvinces,
  initialPriceTiers,
  initialStatuses,
}: {
  initialProvinces: string[];
  initialPriceTiers: string[];
  initialStatuses: string[];
}) {
  const router = useRouter();
  const [provinces, setProvinces] = useState(new Set(initialProvinces));
  const [priceTiers, setPriceTiers] = useState(new Set(initialPriceTiers));
  const [statuses, setStatuses] = useState(new Set(initialStatuses));

  function toggle<T>(set: Set<T>, setter: (s: Set<T>) => void, value: T) {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  }

  function apply() {
    const params = new URLSearchParams();
    if (provinces.size > 0) params.set("tinh", Array.from(provinces).join(","));
    if (priceTiers.size > 0) params.set("gia", Array.from(priceTiers).join(","));
    if (statuses.size > 0) params.set("trangthai", Array.from(statuses).join(","));
    router.push(`/tim-kiem?${params.toString()}`);
  }

  function reset() {
    setProvinces(new Set());
    setPriceTiers(new Set());
    setStatuses(new Set());
  }

  return (
    <div className="flex h-full flex-col bg-paper">
      <div className="relative flex shrink-0 items-center justify-center bg-ink px-4 py-4 text-paper">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Đóng"
          className="absolute left-4 flex h-8 w-8 items-center justify-center text-[16px]"
        >
          ✕
        </button>
        <h1 className="font-display text-[16px] font-bold">Bộ lọc nâng cao</h1>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-4 pb-20">
        <FilterGroup
          title="Tỉnh / Thành phố"
          options={PROVINCE_OPTIONS}
          checked={provinces}
          onToggle={(v) => toggle(provinces, setProvinces, v)}
        />
        <FilterGroup
          title="Mức giá"
          options={PRICE_OPTIONS}
          checked={priceTiers}
          onToggle={(v) => toggle(priceTiers, setPriceTiers, v)}
        />
        <FilterGroup
          title="Trạng thái mở bán"
          options={STATUS_OPTIONS}
          checked={statuses}
          onToggle={(v) => toggle(statuses, setStatuses, v)}
        />
      </div>

      <div className="flex shrink-0 gap-3 border-t border-line bg-white p-3">
        <button type="button" onClick={reset} className="flex-1 rounded-xl border border-line py-3 text-[14px] font-semibold text-ink">
          Xoá lọc
        </button>
        <button type="button" onClick={apply} className="flex-1 rounded-xl bg-gold py-3 text-[14px] font-semibold text-ink">
          Áp dụng bộ lọc
        </button>
      </div>
    </div>
  );
}

function FilterGroup<T extends string>({
  title,
  options,
  checked,
  onToggle,
}: {
  title: string;
  options: Option<T>[];
  checked: Set<T>;
  onToggle: (value: T) => void;
}) {
  return (
    <div>
      <div className="mb-2 font-display text-[14px] font-bold text-ink">{title}</div>
      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2.5 text-[14px] text-graphite/80">
            <input
              type="checkbox"
              checked={checked.has(opt.value)}
              onChange={() => onToggle(opt.value)}
              className="h-4 w-4 accent-gold"
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
}
