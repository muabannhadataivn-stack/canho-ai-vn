import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackHeader } from "@/components/layout/BackHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { ProjectCard } from "@/components/project/ProjectCard";
import { EmptyState } from "@/components/search/EmptyState";
import { getAllProvinces, getProjectsByProvince } from "@/lib/data-source";
import type { ProjectWithTier } from "@/lib/types";

// Template cố định điền số liệu thật — KHÔNG gọi AI, để luôn đúng theo dữ liệu và không cần
// sinh lại/bảo trì. Chỉ gộp giá của dự án có priceUnit "trieu-m2" — trộn lẫn "tỷ/căn" vào
// cùng 1 khoảng "triệu/m²" sẽ ra số liệu sai lệch, gây hiểu nhầm.
function buildProvinceIntro(provinceName: string, projects: ProjectWithTier[]): string {
  const sentences = [`${provinceName} hiện có ${projects.length} dự án căn hộ chung cư đang được cập nhật trên canho.ai.vn.`];

  const lows: number[] = [];
  const highs: number[] = [];
  for (const p of projects) {
    if (p.pricing.priceUnit !== "trieu-m2") continue;
    const { priceMin, priceMax } = p.pricing;
    if (priceMin === undefined && priceMax === undefined) continue;
    lows.push(priceMin ?? priceMax!);
    highs.push(priceMax ?? priceMin!);
  }
  if (lows.length > 0) {
    sentences.push(`Mức giá tham khảo dao động từ ${Math.min(...lows)} đến ${Math.max(...highs)} triệu/m², tuỳ dự án và vị trí cụ thể.`);
  }

  sentences.push("Xem chi tiết từng dự án bên dưới để biết vị trí, tiến độ, tiện ích và pháp lý cụ thể.");
  return sentences.join(" ");
}

export async function generateStaticParams() {
  const provinces = await getAllProvinces();
  return provinces.map((p) => ({ tinh: p.slug }));
}

export async function generateMetadata({ params }: { params: { tinh: string } }): Promise<Metadata> {
  const provinces = await getAllProvinces();
  const province = provinces.find((p) => p.slug === params.tinh);
  if (!province) return {};
  return { title: `Dự án tại ${province.name}` };
}

export default async function KhuVucTinhPage({ params }: { params: { tinh: string } }) {
  const [provinces, projects] = await Promise.all([getAllProvinces(), getProjectsByProvince(params.tinh)]);
  const province = provinces.find((p) => p.slug === params.tinh);
  if (!province) notFound();

  // Route này nằm NGOÀI (tabs) (cùng thư mục vật lý với [slug]/page.tsx, tránh xung đột route
  // — xem quyết định trước đó) nên không tự động được (tabs)/layout.tsx bọc BottomNav. Mô
  // phỏng thủ công lại đúng cấu trúc layout đó (div h-full flex-col > flex-1 overflow-y-auto >
  // BottomNav) — BottomNav tự quản lý active state qua usePathname(), không cần prop nào từ
  // layout cha nên dùng độc lập ở đây vẫn hoạt động đúng.
  return (
    <div className="flex h-full flex-col bg-paper">
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col">
          <BackHeader title={province.name} />
          <div className="p-4">
            {projects.length > 0 && (
              <p className="mb-3 text-[13px] leading-relaxed text-graphite/70">
                {buildProvinceIntro(province.name, projects)}
              </p>
            )}
            <p className="mb-3 font-mono text-[12px] text-graphite/50">{projects.length} dự án tại {province.name}</p>
            {projects.length === 0 ? (
              <EmptyState
                title="Chưa có dự án nào tại khu vực này"
                description="Hệ thống sẽ cập nhật khi có dữ liệu mới."
              />
            ) : (
              <div className="flex flex-col gap-2.5">
                {projects.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
