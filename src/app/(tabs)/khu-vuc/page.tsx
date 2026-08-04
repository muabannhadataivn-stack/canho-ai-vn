import Link from "next/link";
import type { Metadata } from "next";
import { getAllProvinces } from "@/lib/data-source";

export const metadata: Metadata = {
  title: "Khu vực",
};

export default function KhuVucPage() {
  const provinces = getAllProvinces();

  return (
    <div className="flex flex-col">
      <div className="bg-ink px-4 py-5 text-paper">
        <h1 className="font-display text-[19px] font-bold">Khu vực</h1>
        <p className="mt-1 text-[13px] text-paper/60">Chọn tỉnh/thành để xem dự án</p>
      </div>
      <div className="flex flex-col gap-2.5 p-4">
        {provinces.length === 0 ? (
          <p className="py-10 text-center text-[13.5px] text-graphite/50">Chưa có dữ liệu khu vực.</p>
        ) : (
          provinces.map((p) => (
            <Link
              key={p.slug}
              href={`/khu-vuc/${p.slug}`}
              className="flex items-center justify-between rounded-2xl border border-line bg-white px-4 py-3.5"
            >
              <span className="font-display text-[15px] font-bold text-ink">{p.name}</span>
              <span className="font-mono text-[12px] text-graphite/50">{p.count} dự án</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
