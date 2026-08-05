import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { assembleProjects } from "@/lib/data-source";
import type { ProjectRow } from "@/lib/supabase-mapping";
import { EditProjectForm } from "@/components/admin/EditProjectForm";

// Bắt buộc fetch luôn tươi (không dùng Next.js Data Cache) — phải thấy đúng dữ liệu
// mới nhất của dự án, không được phục vụ response cache từ request trước.
export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const { data, error } = await supabaseServer.from("projects").select("*").eq("id", params.id).maybeSingle();
  if (error) throw error;
  if (!data) notFound();

  const [project] = await assembleProjects([data as ProjectRow]);
  if (!project) notFound();

  return <EditProjectForm project={project} />;
}
