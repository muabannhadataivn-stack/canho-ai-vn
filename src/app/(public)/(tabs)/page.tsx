import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/ui/Logo";
import { Chip } from "@/components/ui/Chip";
import { ProjectCard } from "@/components/project/ProjectCard";
import { getAllProvinces, getPublishedProjects } from "@/lib/data-source";
import { PRICE_TIER_LABEL } from "@/lib/price-tier";

export const metadata: Metadata = {
  title: "canho.ai.vn — Tra cứu dữ liệu dự án căn hộ chung cư",
};

export default async function HomePage() {
  const [allProvinces, publishedProjects] = await Promise.all([getAllProvinces(), getPublishedProjects()]);
  const provinces = allProvinces.slice(0, 3);
  const recentProjects = [...publishedProjects]
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, 4);
  const priceTiers = Object.entries(PRICE_TIER_LABEL) as [keyof typeof PRICE_TIER_LABEL, string][];

  return (
    <div>
      <div className="bg-ink px-4 pb-6 pt-6 text-paper">
        <div className="mb-5 flex items-center justify-between">
          <Logo />
          <div className="flex gap-1">
            <Link href="/thong-bao" aria-label="Thông báo" className="flex h-8 w-8 items-center justify-center rounded-full">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M5 8a5 5 0 0110 0c0 4 1.5 5 1.5 5h-13S5 12 5 8z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8.5 16a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </Link>
            <Link href="/tim-kiem" aria-label="Tìm kiếm" className="flex h-8 w-8 items-center justify-center rounded-full">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <circle cx="8.5" cy="8.5" r="6" stroke="currentColor" strokeWidth="1.6" />
                <line x1="13" y1="13" x2="18" y2="18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </Link>
          </div>
        </div>
        <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-blueprint-light">
          Dữ liệu dự án · cập nhật công khai
        </p>
        <h1 className="mb-4 font-display text-[24px] font-bold leading-tight">
          Tra cứu tiến độ, vị trí và chủ đầu tư dự án căn hộ chung cư
        </h1>
        <Link
          href="/tim-kiem"
          className="mb-4 flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3.5 text-[14px] text-paper/70"
        >
          <span>Tìm theo tên dự án, khu vực...</span>
          <b className="text-paper">Tìm</b>
        </Link>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <Chip active>Toàn quốc</Chip>
          <Chip href="/tp-hcm">TP.HCM</Chip>
          <Chip href="/ha-noi">Hà Nội</Chip>
        </div>
      </div>

      <section className="px-4 pt-5">
        <h2 className="mb-3 font-display text-[16px] font-bold text-ink">Khu vực nổi bật</h2>
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar">
          {provinces.map((p) => (
            <Link
              key={p.slug}
              href={`/${p.slug}`}
              className="flex min-w-[112px] flex-col gap-1 rounded-2xl border border-line bg-white p-3.5"
            >
              <span className="font-display text-[15px] font-bold text-ink">{p.name}</span>
              <span className="font-mono text-[11px] text-graphite/50">{p.count} dự án</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-4 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-[16px] font-bold text-ink">Cập nhật gần đây</h2>
          <Link href="/tim-kiem" className="text-[12.5px] font-medium text-blueprint">
            Xem tất cả →
          </Link>
        </div>
        <div className="flex flex-col gap-2.5">
          {recentProjects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </section>

      <section className="px-4 pt-6">
        <h2 className="mb-3 font-display text-[16px] font-bold text-ink">Mức giá</h2>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {priceTiers.map(([tier, label]) => (
            <Chip key={tier} href={`/muc-gia/${tier}`}>
              {label}
            </Chip>
          ))}
        </div>
      </section>

      <section className="mx-4 mt-6 rounded-2xl bg-ink p-5 text-paper">
        <div className="mb-1 font-display text-[15px] font-bold">Đại diện chủ đầu tư hoặc môi giới?</div>
        <p className="mb-3 text-[13px] text-paper/70">Gửi thông tin cập nhật về dự án của bạn.</p>
        <Link href="/gui-thong-tin-du-an" className="text-[13.5px] font-semibold text-gold">
          Gửi thông tin dự án →
        </Link>
      </section>

      <footer className="flex flex-wrap gap-x-4 gap-y-2 px-4 py-8 text-[12.5px] text-graphite/60">
        <Link href="/ve-chung-toi">Về chúng tôi</Link>
        <Link href="/nguon-du-lieu">Nguồn dữ liệu</Link>
        <Link href="/dieu-khoan-bao-mat">Điều khoản & Bảo mật</Link>
        <Link href="/lien-he">Liên hệ</Link>
      </footer>
    </div>
  );
}
