import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackHeader } from "@/components/layout/BackHeader";
import { ProjectCard } from "@/components/project/ProjectCard";
import { EmptyState } from "@/components/search/EmptyState";
import { getProjectsByPriceTier } from "@/lib/data-source";
import { PRICE_TIER_LABEL } from "@/lib/price-tier";
import type { PriceTier } from "@/lib/types";

const VALID_TIERS = Object.keys(PRICE_TIER_LABEL) as Exclude<PriceTier, null>[];

export function generateStaticParams() {
  return VALID_TIERS.map((tier) => ({ tier }));
}

export function generateMetadata({ params }: { params: { tier: string } }): Metadata {
  const label = PRICE_TIER_LABEL[params.tier as Exclude<PriceTier, null>];
  if (!label) return {};
  return { title: `Dự án mức giá ${label}` };
}

export default async function MucGiaPage({ params }: { params: { tier: string } }) {
  const tier = params.tier as Exclude<PriceTier, null>;
  const label = PRICE_TIER_LABEL[tier];
  if (!label) notFound();

  const projects = await getProjectsByPriceTier(tier);

  return (
    <div className="flex h-full flex-col">
      <BackHeader title={label} />
      <div className="flex-1 overflow-y-auto p-4">
        <p className="mb-3 font-mono text-[12px] text-graphite/50">{projects.length} dự án trong khoảng giá này</p>
        {projects.length === 0 ? (
          <EmptyState
            title="Chưa có dự án nào ở mức giá này"
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
  );
}
