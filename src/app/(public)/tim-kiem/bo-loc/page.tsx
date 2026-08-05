import type { Metadata } from "next";
import { FilterPanel } from "@/components/search/FilterPanel";

export const metadata: Metadata = { title: "Bộ lọc nâng cao" };

interface BoLocPageProps {
  searchParams: { tinh?: string; gia?: string; trangthai?: string };
}

export default function BoLocPage({ searchParams }: BoLocPageProps) {
  return (
    <FilterPanel
      initialProvinces={searchParams.tinh ? searchParams.tinh.split(",") : []}
      initialPriceTiers={searchParams.gia ? searchParams.gia.split(",") : []}
      initialStatuses={searchParams.trangthai ? searchParams.trangthai.split(",") : []}
    />
  );
}
