"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function SearchBar({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialQuery);

  function submit() {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("q", value.trim());
    } else {
      params.delete("q");
    }
    router.push(`/tim-kiem?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5">
      <svg width="13" height="13" viewBox="0 0 20 20" fill="none" className="shrink-0 text-paper/60">
        <circle cx="8.5" cy="8.5" r="6" stroke="currentColor" strokeWidth="1.6" />
        <line x1="13" y1="13" x2="18" y2="18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        placeholder="Tìm theo tên dự án, khu vực..."
        aria-label="Tìm kiếm dự án"
        className="flex-1 bg-transparent text-[14px] text-paper placeholder:text-paper/50 focus:outline-none"
      />
      <button type="button" onClick={submit} className="text-[13px] font-semibold text-paper">
        Tìm
      </button>
    </div>
  );
}
