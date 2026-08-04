import { SpecBlock } from "./SpecBlock";
import type { ProjectWithTier } from "@/lib/types";

export function QuickInfoGrid({ project, number }: { project: ProjectWithTier; number: number }) {
  const items: { k: string; v: string; highlight?: boolean }[] = [
    { k: "Chủ đầu tư", v: project.developer ?? "Đang cập nhật" },
  ];
  if (project.scale) items.push({ k: "Quy mô", v: project.scale });
  if (project.units) items.push({ k: "Số toà", v: project.units });
  if (project.handoverExpected) items.push({ k: "Bàn giao dự kiến", v: project.handoverExpected, highlight: true });
  if (project.buildingDensity) items.push({ k: "Mật độ XD", v: project.buildingDensity });
  if (project.startDate) items.push({ k: "Khởi công", v: project.startDate });

  return (
    <SpecBlock number={number} title="Thông tin nhanh" id="section-tong-quan">
      <div className="grid grid-cols-2 gap-2.5">
        {items.map((item) => (
          <div
            key={item.k}
            className={`rounded-xl border p-3 ${item.highlight ? "border-gold bg-gold/10" : "border-line bg-white"}`}
          >
            <div className="text-[11px] text-graphite/50">{item.k}</div>
            <div className="mt-0.5 font-display text-[14px] font-bold text-ink">{item.v}</div>
          </div>
        ))}
      </div>
    </SpecBlock>
  );
}
