import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { assembleProjects } from "@/lib/data-source";
import type { ProjectRow } from "@/lib/supabase-mapping";
import { EditProjectForm } from "@/components/admin/EditProjectForm";

// Bắt buộc fetch luôn tươi (không dùng Next.js Data Cache) — phải thấy đúng dữ liệu
// mới nhất của dự án, không được phục vụ response cache từ request trước.
export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const [{ data, error }, { data: aiContentRows, error: aiContentError }, { data: galleryRows, error: galleryError }] =
    await Promise.all([
      supabaseServer.from("projects").select("*").eq("id", params.id).maybeSingle(),
      // Chỉ cần biết ĐÃ TỪNG có nội dung AI hay chưa (quyết định hiện nút "Sinh lại nội dung
      // AI") — không cần nội dung thật, nên chỉ select "id", limit 1.
      supabaseServer.from("project_ai_content").select("id").eq("project_id", params.id).limit(1),
      // Riêng cho admin quản lý (hiển thị lưới + nút Xoá/Đặt bìa) — CẦN "id" và "is_cover" của
      // từng ảnh, khác với Project.media.gallery công khai (chỉ url/alt, không id, KHÔNG đổi
      // type Project trong types.ts cho việc này).
      supabaseServer
        .from("project_images")
        .select("id, image_url, image_alt, is_cover")
        .eq("project_id", params.id)
        .order("sort_order"),
    ]);
  if (error) throw error;
  if (!data) notFound();
  if (aiContentError) throw aiContentError;
  if (galleryError) throw galleryError;

  const [project] = await assembleProjects([data as ProjectRow]);
  if (!project) notFound();

  const galleryImages = (galleryRows ?? []).map((r) => ({
    id: r.id as string,
    url: r.image_url as string,
    alt: (r.image_alt as string | null) ?? "",
    isCover: r.is_cover as boolean,
  }));

  return (
    <EditProjectForm
      project={project}
      hasAiContent={Boolean(aiContentRows && aiContentRows.length > 0)}
      initialGalleryImages={galleryImages}
    />
  );
}
