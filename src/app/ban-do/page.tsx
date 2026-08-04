import type { Metadata } from "next";
import { BackHeader } from "@/components/layout/BackHeader";
import { MapCanvas } from "@/components/map/MapCanvas";
import { getPublishedProjects } from "@/lib/data-source";

export const metadata: Metadata = { title: "Bản đồ dự án" };

export default function BanDoPage({ searchParams }: { searchParams: { "du-an"?: string } }) {
  const projects = getPublishedProjects();

  return (
    <div className="flex h-full flex-col bg-paper">
      <BackHeader title="Bản đồ dự án" />
      <MapCanvas projects={projects} initialSlug={searchParams["du-an"]} />
    </div>
  );
}
