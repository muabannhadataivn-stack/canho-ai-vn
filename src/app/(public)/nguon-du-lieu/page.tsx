import type { Metadata } from "next";
import { StaticPageLayout } from "@/components/layout/StaticPageLayout";

export const metadata: Metadata = { title: "Nguồn dữ liệu" };

const SOURCES = [
  { name: "Cổng thông tin quy hoạch tỉnh/thành", desc: "Danh mục dự án, quy hoạch sử dụng đất" },
  { name: "Sở Xây dựng các tỉnh/thành", desc: "Danh sách dự án nhà ở, tiến độ" },
  { name: "Cổng thông tin quốc gia về đầu tư", desc: "Chủ trương đầu tư, quy mô dự án" },
];

export default function NguonDuLieuPage() {
  return (
    <StaticPageLayout title="Nguồn dữ liệu">
      <p>Dữ liệu được tổng hợp từ các nguồn công khai sau:</p>
      <div className="space-y-3">
        {SOURCES.map((s) => (
          <div key={s.name} className="rounded-xl border border-line bg-white p-3.5">
            <div className="text-[13.5px] font-semibold text-ink">{s.name}</div>
            <div className="text-[12.5px] text-graphite/55">{s.desc}</div>
          </div>
        ))}
      </div>
      <p className="pt-2 text-[12.5px] text-graphite/50">
        Dữ liệu trên canho.ai.vn ở giai đoạn hiện tại là dữ liệu minh hoạ cho mục đích dựng giao diện,
        chưa phải kết quả thu thập từ pipeline tự động thật.
      </p>
    </StaticPageLayout>
  );
}
