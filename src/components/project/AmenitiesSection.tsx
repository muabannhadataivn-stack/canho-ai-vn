import { SpecBlock } from "./SpecBlock";
import type { NearbyAmenity, NearbyCategory, ProjectWithTier } from "@/lib/types";

const CATEGORY_LABEL: Record<NearbyCategory, string> = {
  "truong-hoc": "Trường học",
  "benh-vien": "Bệnh viện",
  "sieu-thi-ttTM": "Mua sắm",
  "cong-vien": "Công viên",
  cho: "Chợ",
  "ngan-hang": "Ngân hàng",
};

export function hasAmenitiesData(project: ProjectWithTier): boolean {
  return project.amenities.length > 0 || project.nearbyAmenities.length > 0;
}

export function AmenitiesSection({ project, number }: { project: ProjectWithTier; number: number }) {
  const grouped = groupByCategory(project.nearbyAmenities);

  return (
    <SpecBlock number={number} title="Tiện ích" id="section-tien-ich">
      {project.amenities.length > 0 && (
        <>
          <div className="mb-1.5 font-mono text-[11px] uppercase tracking-wide text-graphite/45">Nội khu</div>
          <div className="mb-3 grid grid-cols-2 gap-2">
            {project.amenities.slice(0, 6).map((a) => (
              <div key={a.name} className="rounded-xl border border-line bg-white p-2.5">
                <div className="text-[13px] font-semibold text-ink">{a.name}</div>
                {a.desc && <div className="text-[11.5px] text-graphite/50">{a.desc}</div>}
              </div>
            ))}
          </div>
        </>
      )}

      {grouped.length > 0 && (
        <>
          <div className="mb-1.5 font-mono text-[11px] uppercase tracking-wide text-graphite/45">
            Lân cận (bán kính quét)
          </div>
          <div className="space-y-2">
            {grouped.map(([category, items]) => (
              <div key={category} className="rounded-xl border border-line bg-white p-2.5">
                <div className="mb-1 text-[12.5px] font-semibold text-blueprint">{CATEGORY_LABEL[category]}</div>
                {items.map((item) => (
                  <div key={item.name} className="flex justify-between gap-2 text-[13px]">
                    <span className="text-ink/80">{item.name}</span>
                    <span className="shrink-0 font-mono text-[12px] text-graphite/50">
                      {item.withinProject ? "Trong khuôn viên" : formatDistance(item.distanceMeters)}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </SpecBlock>
  );
}

function groupByCategory(items: NearbyAmenity[]): [NearbyCategory, NearbyAmenity[]][] {
  const map = new Map<NearbyCategory, NearbyAmenity[]>();
  for (const item of items) {
    const list = map.get(item.category) ?? [];
    list.push(item);
    map.set(item.category, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.distanceMeters - b.distanceMeters);
    list.splice(3); // tối đa 2-3 mục gần nhất mỗi nhóm
  }
  return Array.from(map.entries());
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters} m`;
  return `${(meters / 1000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} km`;
}
