import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BackButton } from "@/components/layout/BackButton";
import { StatusBadge } from "@/components/project/StatusBadge";
import { StickyCTA } from "@/components/layout/StickyCTA";
import { DetailTabsNav } from "@/components/project/DetailTabsNav";
import { QuickInfoGrid } from "@/components/project/QuickInfoGrid";
import { LocationSection } from "@/components/project/LocationSection";
import { AmenitiesSection, hasAmenitiesData } from "@/components/project/AmenitiesSection";
import { TimelineSection } from "@/components/project/TimelineSection";
import { PricingTable, hasPricingData } from "@/components/project/PricingTable";
import { FitForSection } from "@/components/project/FitForSection";
import { FAQSection } from "@/components/project/FAQSection";
import { RelatedProjects } from "@/components/project/RelatedProjects";
import { ChoCuDanPromo } from "@/components/project/ChoCuDanPromo";
import { formatUpdatedDate } from "@/lib/format";
import { getProjectBySlug, getPublishedProjectParams, getPublishedProjects } from "@/lib/data-source";
import { getRelatedProjects } from "@/lib/related-projects";
import {
  buildApartmentComplexJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildOfferJsonLd,
  projectUrl,
  SITE_URL,
} from "@/lib/jsonld";

interface ProjectPageProps {
  params: { tinh: string; slug: string };
}

// Chỉ sinh trang tĩnh cho dự án publicationStatus === "published".
// Dữ liệu draft/mock KHÔNG được vào đây → không bị Next.js xuất ra HTML tĩnh, không vô tình index.
export function generateStaticParams() {
  return getPublishedProjectParams();
}

export function generateMetadata({ params }: ProjectPageProps): Metadata {
  const project = getProjectBySlug(params.tinh, params.slug);
  if (!project || project.publicationStatus !== "published") return {};

  const url = projectUrl(project);
  const areaLabel = project.district ? `${project.district}, ${project.province}` : project.province;
  const title = `${project.name} – Căn hộ chung cư tại ${areaLabel} | Cập nhật ${new Date(project.updatedAt).getFullYear()}`;
  const description = `${project.name} tại ${areaLabel}: tổng quan, tiện ích, tiến độ triển khai và mức giá tham khảo — cập nhật ${formatUpdatedDate(project.updatedAt)}.`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: project.media.heroImage ? [`${SITE_URL}${project.media.heroImage}`] : undefined,
    },
  };
}

export default function ProjectDetailPage({ params }: ProjectPageProps) {
  const project = getProjectBySlug(params.tinh, params.slug);

  // Draft không có trang tĩnh (không trong generateStaticParams), nhưng nếu ai đó cố truy cập
  // trực tiếp URL của 1 dự án draft, vẫn trả 404 công khai — không lộ dữ liệu chưa duyệt.
  if (!project || project.publicationStatus !== "published") {
    notFound();
  }

  const areaLabel = project.district ? `${project.district}, ${project.province}` : project.province;

  // Đoạn mở đầu 100-150 từ — văn bản thật bắt buộc, sinh từ dữ liệu có sẵn (không viết tay tự do).
  const introParts: string[] = [
    `${project.name} là dự án căn hộ chung cư tại ${areaLabel}${project.developer ? `, do ${project.developer} phát triển` : ""}.`,
  ];
  if (project.scale) introParts.push(`Quy mô dự án khoảng ${project.scale}.`);
  if (project.startDate) introParts.push(`Khởi công từ ${project.startDate}.`);
  if (project.handoverExpected) introParts.push(`Dự kiến bàn giao ${project.handoverExpected}.`);
  introParts.push(
    project.salesStatus === "da-ban-giao"
      ? "Dự án đã bàn giao, thông tin trên trang phục vụ tra cứu tiện ích và tiến độ thực tế."
      : "Thông tin được tổng hợp từ nguồn công khai và cập nhật định kỳ."
  );
  const intro = introParts.join(" ");

  // ---- Sắp số H2 tuần tự: chỉ đánh số các section THỰC SỰ hiển thị ----
  const relatedProjects = getRelatedProjects(project, getPublishedProjects());
  const sectionFlags = [
    { key: "quick-info", visible: true }, // luôn hiện (developer có fallback "Đang cập nhật")
    { key: "location", visible: true }, // luôn hiện (address có fallback district+province)
    { key: "amenities", visible: hasAmenitiesData(project) },
    { key: "timeline", visible: project.timeline.length > 0 },
    { key: "pricing", visible: hasPricingData(project) },
    { key: "fit-for", visible: project.fitFor.length > 0 },
    { key: "faq", visible: true }, // FAQSection tối thiểu luôn có 2 câu (salesStatus + đầu tư)
    { key: "related", visible: relatedProjects.length > 0 },
  ] as const;

  let counter = 0;
  const numbers: Record<string, number> = {};
  for (const s of sectionFlags) {
    if (s.visible) {
      counter += 1;
      numbers[s.key] = counter;
    }
  }

  const breadcrumbJsonLd = buildBreadcrumbJsonLd(project);
  const apartmentComplexJsonLd = buildApartmentComplexJsonLd(project);
  const offerJsonLd = buildOfferJsonLd(project);
  const faqJsonLd = buildFaqJsonLd(project);

  return (
    <div className="flex h-full flex-col bg-paper">
      {/* JSON-LD sinh từ CÙNG 1 object `project` — buildFaqJsonLd gọi lại đúng buildFaqEntries
          mà FAQSection dùng để render, đảm bảo khớp 100% giữa HTML hiển thị và schema. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(apartmentComplexJsonLd) }} />
      {offerJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offerJsonLd) }} />
      )}
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="relative h-48 shrink-0 bg-ink">
          <Image
            src={project.media.heroImage ?? "/images/project-fallback.webp"}
            alt={project.media.heroImageAlt ?? `Ảnh minh hoạ dự án ${project.name}`}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
          <div className="absolute left-3 top-3">
            <BackButton />
          </div>
          {!project.media.heroImage && (
            <span className="absolute bottom-2 right-3 rounded-full bg-ink/70 px-2.5 py-1 text-[10.5px] text-paper/80">
              Ảnh minh hoạ
            </span>
          )}
        </div>

        <div className="px-4 pt-4">
          <div className="mb-1.5 flex items-center justify-between">
            <StatusBadge status={project.salesStatus} />
            <span className="font-mono text-[10.5px] text-graphite/45">
              Cập nhật {formatUpdatedDate(project.updatedAt)}
            </span>
          </div>
          {/* 1 H1 duy nhất cho toàn trang */}
          <h1 className="font-display text-[21px] font-bold leading-tight text-ink">{project.name}</h1>
          <div className="mt-0.5 text-[13px] text-graphite/60">{areaLabel} · Căn hộ chung cư</div>
          <p className="mt-2.5 text-[13.5px] leading-relaxed text-graphite/75">{intro}</p>
        </div>

        <DetailTabsNav />

        <QuickInfoGrid project={project} number={numbers["quick-info"]!} />
        <LocationSection project={project} number={numbers["location"]!} />
        {sectionFlags[2]!.visible && <AmenitiesSection project={project} number={numbers["amenities"]!} />}

        <ChoCuDanPromo community={project.community} />

        {sectionFlags[3]!.visible && <TimelineSection project={project} number={numbers["timeline"]!} />}
        {sectionFlags[4]!.visible && <PricingTable project={project} number={numbers["pricing"]!} />}
        {sectionFlags[5]!.visible && <FitForSection project={project} number={numbers["fit-for"]!} />}
        <FAQSection project={project} number={numbers["faq"]!} />
        {sectionFlags[7]!.visible && (
          <RelatedProjects projects={relatedProjects} number={numbers["related"]!} />
        )}

        <div className="h-6" />

        <StickyCTA projectName={project.name} />
      </div>
    </div>
  );
}
