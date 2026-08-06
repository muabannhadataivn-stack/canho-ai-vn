"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PROVINCES } from "@/lib/admin-constants";

const DEBOUNCE_MS = 300;

// Tìm kiếm/lọc qua server (không phải client-side filter) — danh sách 1834 dự án đang
// phân trang server (page.tsx), lọc client trên mảng đã tải chỉ đúng trong phạm vi trang
// hiện tại (≤30 dòng), không đúng trên toàn bộ dữ liệu. Input debounce 300ms rồi cập nhật
// URL (?q=...) để cảm giác gần như tức thời mà không gọi server mỗi phím gõ.
export function AdminProjectFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateParams(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page"); // đổi bộ lọc thì quay về trang 1
    router.replace(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  }

  function handleQChange(value: string) {
    setQ(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateParams({ q: value.trim() || undefined });
    }, DEBOUNCE_MS);
  }

  return (
    <div className="mb-4 flex flex-wrap gap-2.5">
      <input
        type="text"
        value={q}
        onChange={(e) => handleQChange(e.target.value)}
        placeholder="Tìm theo tên dự án..."
        className="min-w-[220px] flex-1 rounded-xl border border-line bg-white px-3.5 py-2 text-[13.5px] text-ink outline-none focus:border-blueprint"
      />
      <select
        defaultValue={searchParams.get("status") ?? ""}
        onChange={(e) => updateParams({ status: e.target.value || undefined })}
        className="rounded-xl border border-line bg-white px-3 py-2 text-[13.5px] text-ink"
      >
        <option value="">Tất cả trạng thái</option>
        <option value="draft">Draft</option>
        <option value="published">Đã publish</option>
      </select>
      <select
        defaultValue={searchParams.get("province") ?? ""}
        onChange={(e) => updateParams({ province: e.target.value || undefined })}
        className="rounded-xl border border-line bg-white px-3 py-2 text-[13.5px] text-ink"
      >
        <option value="">Tất cả tỉnh/thành</option>
        {PROVINCES.map((p) => (
          <option key={p.slug} value={p.slug}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}
