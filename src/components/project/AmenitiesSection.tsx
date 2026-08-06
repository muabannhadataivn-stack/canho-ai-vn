import { SpecBlock } from "./SpecBlock";
import type { NearbyAmenity, NearbyCategory, ProjectWithTier } from "@/lib/types";

export const CATEGORY_LABEL: Record<NearbyCategory, string> = {
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

// SVG line-art tự vẽ, cùng convention với icon chuông/tìm kiếm ở trang chủ
// (viewBox 0 0 20 20, stroke="currentColor", strokeWidth 1.6) — không dùng emoji,
// màu lấy từ text-blueprint của phần tử cha qua currentColor.
function NearbyCategoryIcon({ category }: { category: NearbyCategory }) {
  const common = {
    width: 15,
    height: 15,
    viewBox: "0 0 20 20",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "shrink-0",
  };

  switch (category) {
    case "truong-hoc":
      // Sách mở — trường học
      return (
        <svg {...common} aria-hidden>
          <path d="M3 5c2-1.2 4.2-1.2 6 0v10c-1.8-1.2-4-1.2-6 0V5z" />
          <path d="M17 5c-2-1.2-4.2-1.2-6 0v10c1.8-1.2 4-1.2 6 0V5z" />
        </svg>
      );
    case "benh-vien":
      // Dấu cộng y tế
      return (
        <svg {...common} aria-hidden>
          <rect x="3" y="3" width="14" height="14" rx="3" />
          <path d="M10 6.5v7M6.5 10h7" />
        </svg>
      );
    case "sieu-thi-ttTM":
      // Túi mua sắm
      return (
        <svg {...common} aria-hidden>
          <path d="M5 7h10l-1 10H6L5 7z" />
          <path d="M7.5 7V5.5a2.5 2.5 0 015 0V7" />
        </svg>
      );
    case "cong-vien":
      // Cây — công viên (đơn giản hoá: tán tròn + thân)
      return (
        <svg {...common} aria-hidden>
          <circle cx="10" cy="8" r="5" />
          <path d="M10 13v4" />
        </svg>
      );
    case "cho":
      // Giỏ hàng — chợ
      return (
        <svg {...common} aria-hidden>
          <path d="M4 8h12l-1.5 8h-9L4 8z" />
          <path d="M7 8l1-4h4l1 4" />
          <path d="M8 11v3M12 11v3" />
        </svg>
      );
    case "ngan-hang":
      // Toà nhà cột trụ — ngân hàng
      return (
        <svg {...common} aria-hidden>
          <path d="M3 8l7-4 7 4" />
          <path d="M4 8v7M8 8v7M12 8v7M16 8v7" />
          <path d="M3 17h14" />
        </svg>
      );
  }
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
                <div className="mb-1 flex items-center gap-1.5 text-[12.5px] font-semibold text-blueprint">
                  <NearbyCategoryIcon category={category} />
                  {CATEGORY_LABEL[category]}
                </div>
                {items.map((item) => (
                  <div key={item.name} className="flex justify-between gap-2 text-[13px]">
                    <span className="text-ink/80">
                      <span className="mr-1.5 text-graphite/50">–</span>
                      {item.name}
                    </span>
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
