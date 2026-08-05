import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import { createSupabaseServerClient } from "@/lib/supabase-server-auth";

// Bắt buộc fetch luôn tươi (không dùng Next.js Data Cache) — trang admin phải thấy
// ngay dự án vừa tạo/sửa, không được phục vụ response cache từ request trước.
export const dynamic = "force-dynamic";

// Danh sách có thể lên tới hàng nghìn dòng sau khi nhập CSV (xem /admin/du-an/nhap-csv) —
// phân trang để không render hết 1 lần.
const PAGE_SIZE = 30;

interface ProjectListRow {
  id: string;
  name: string;
  province: string;
  publication_status: string;
  updated_at: string;
}

// Danh sách TOÀN BỘ dự án (cả draft lẫn published) — dùng supabaseServer (service_role)
// trực tiếp thay vì lib/data-source.ts, vì data-source.ts chỉ trả published cho trang công khai.
export default async function AdminProjectListPage({ searchParams }: { searchParams: { page?: string } }) {
  const page = Math.max(1, Math.floor(Number(searchParams.page)) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const [{ count, error: countError }, { data, error }] = await Promise.all([
    supabaseServer.from("projects").select("*", { count: "exact", head: true }),
    supabaseServer
      .from("projects")
      .select("id, name, province, publication_status, updated_at")
      .order("updated_at", { ascending: false })
      .range(from, to),
  ]);

  if (countError) throw countError;
  if (error) throw error;

  const projects = (data ?? []) as ProjectListRow[];
  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const supabaseAuth = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-[19px] font-bold text-ink">
            Dự án <span className="text-graphite/50">— {totalCount} dự án</span>
          </h1>
          <p className="mt-0.5 text-[12.5px] text-graphite/50">Đăng nhập: {user?.email ?? "(không xác định)"}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/du-an/nhap-csv"
            className="rounded-full border border-line px-4 py-2 text-[13.5px] font-semibold text-ink hover:bg-paper-dim"
          >
            Nhập CSV
          </Link>
          <Link
            href="/admin/du-an/moi"
            className="rounded-full bg-ink px-4 py-2 text-[13.5px] font-semibold text-paper"
          >
            + Thêm dự án mới
          </Link>
        </div>
      </div>

      {projects.length === 0 ? (
        <p className="text-[14px] text-graphite/60">Chưa có dự án nào.</p>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <table className="w-full text-left text-[13.5px]">
              <thead className="bg-paper-dim text-[12px] uppercase tracking-wide text-graphite/60">
                <tr>
                  <th className="px-4 py-2.5">Tên dự án</th>
                  <th className="px-4 py-2.5">Tỉnh/thành</th>
                  <th className="px-4 py-2.5">Trạng thái</th>
                  <th className="px-4 py-2.5">Cập nhật</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} className="border-t border-line hover:bg-paper-dim">
                    <td className="p-0">
                      <Link href={`/admin/du-an/${p.id}`} className="block px-4 py-2.5 font-medium text-ink">
                        {p.name}
                      </Link>
                    </td>
                    <td className="p-0">
                      <Link href={`/admin/du-an/${p.id}`} className="block px-4 py-2.5 text-graphite">
                        {p.province}
                      </Link>
                    </td>
                    <td className="p-0">
                      <Link href={`/admin/du-an/${p.id}`} className="block px-4 py-2.5">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${
                            p.publication_status === "published"
                              ? "bg-green/15 text-green"
                              : "bg-gold/15 text-gold-dark"
                          }`}
                        >
                          {p.publication_status === "published" ? "Đã publish" : "Draft"}
                        </span>
                      </Link>
                    </td>
                    <td className="p-0">
                      <Link href={`/admin/du-an/${p.id}`} className="block px-4 py-2.5 text-graphite/70">
                        {p.updated_at}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-[13px]">
            <span className="text-graphite/60">
              Trang {page}/{totalPages}
            </span>
            <div className="flex gap-2">
              {page > 1 ? (
                <Link href={`/admin/du-an?page=${page - 1}`} className="rounded-full border border-line px-3.5 py-1.5 font-medium text-ink hover:bg-paper-dim">
                  ← Trang trước
                </Link>
              ) : (
                <span className="rounded-full border border-line px-3.5 py-1.5 font-medium text-graphite/30">← Trang trước</span>
              )}
              {page < totalPages ? (
                <Link href={`/admin/du-an?page=${page + 1}`} className="rounded-full border border-line px-3.5 py-1.5 font-medium text-ink hover:bg-paper-dim">
                  Trang sau →
                </Link>
              ) : (
                <span className="rounded-full border border-line px-3.5 py-1.5 font-medium text-graphite/30">Trang sau →</span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
