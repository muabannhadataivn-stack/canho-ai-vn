import Link from "next/link";

export function FilterPillRow({ activeCount, queryString }: { activeCount: number; queryString: string }) {
  return (
    <div className="flex gap-2 overflow-x-auto border-b border-line bg-white px-4 py-2.5 no-scrollbar">
      <Link
        href={`/tim-kiem/bo-loc${queryString ? `?${queryString}` : ""}`}
        className="flex items-center gap-1 whitespace-nowrap rounded-full bg-ink px-3.5 py-1.5 text-[12.5px] font-semibold text-paper"
      >
        ☰ Bộ lọc{activeCount > 0 ? ` (${activeCount})` : ""}
      </Link>
      <span className="flex items-center whitespace-nowrap rounded-full border border-line px-3.5 py-1.5 text-[12.5px] text-ink/60">
        Tỉnh thành ▾
      </span>
      <span className="flex items-center whitespace-nowrap rounded-full border border-line px-3.5 py-1.5 text-[12.5px] text-ink/60">
        Mức giá ▾
      </span>
      <span className="flex items-center whitespace-nowrap rounded-full border border-line px-3.5 py-1.5 text-[12.5px] text-ink/60">
        Trạng thái ▾
      </span>
    </div>
  );
}
