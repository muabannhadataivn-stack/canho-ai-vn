import { SpecBlock } from "./SpecBlock";
import type { ProjectWithTier } from "@/lib/types";

export function hasPricingData(project: ProjectWithTier): boolean {
  return (
    (project.pricing.priceTable && project.pricing.priceTable.length > 0) ||
    project.pricing.priceMin !== undefined ||
    project.pricing.priceMax !== undefined
  );
}

export function PricingTable({ project, number }: { project: ProjectWithTier; number: number }) {
  const table = project.pricing.priceTable;

  return (
    <SpecBlock number={number} title="Sản phẩm & giá" id="section-gia">
      {table && table.length > 0 ? (
        <div className="space-y-2">
          {table.map((entry) => (
            <div key={entry.type} className="flex items-center justify-between rounded-xl border border-line bg-white p-3">
              <div>
                <div className="font-display text-[14px] font-bold text-ink">{entry.type}</div>
                <div className="text-[12px] text-graphite/50">
                  {entry.areaMin}–{entry.areaMax} m²
                </div>
              </div>
              <div className="text-[13px] font-semibold text-blueprint">
                {entry.priceMin}–{entry.priceMax} {project.pricing.priceUnit === "ty-can" ? "tỷ/căn" : "tr/m²"}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-line bg-white p-3 text-[13px] text-ink">
          Giá tham khảo: {project.pricing.priceMin}
          {project.pricing.priceMax ? `–${project.pricing.priceMax}` : ""}{" "}
          {project.pricing.priceUnit === "ty-can" ? "tỷ/căn" : "triệu/m²"}
        </div>
      )}
      <p className="mt-2 text-[11.5px] text-graphite/45">
        {project.pricing.priceNote ?? "Giá tham khảo, có thể thay đổi theo thời điểm giao dịch."}
      </p>
    </SpecBlock>
  );
}
