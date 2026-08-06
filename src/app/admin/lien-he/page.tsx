import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";

// Bắt buộc fetch luôn tươi — danh sách đăng ký tư vấn phải thấy ngay lượt vừa gửi.
export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

interface ContactRequestRow {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  wants_email_report: boolean;
  created_at: string;
  projects: { name: string } | null;
}

export default async function AdminContactRequestsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Math.max(1, Math.floor(Number(searchParams.page)) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await supabaseServer
    .from("contact_requests")
    .select("id, full_name, phone, email, wants_email_report, created_at, projects(name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) throw error;

  const requests = (data ?? []) as unknown as ContactRequestRow[];
  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-[19px] font-bold text-ink">
          Đăng ký tư vấn <span className="text-graphite/50">— {totalCount} lượt</span>
        </h1>
        <Link href="/admin/du-an" className="text-[13px] font-medium text-blueprint">
          ← Danh sách dự án
        </Link>
      </div>

      {requests.length === 0 ? (
        <p className="text-[14px] text-graphite/60">Chưa có lượt đăng ký nào.</p>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <table className="w-full text-left text-[13.5px]">
              <thead className="bg-paper-dim text-[12px] uppercase tracking-wide text-graphite/60">
                <tr>
                  <th className="px-4 py-2.5">Dự án</th>
                  <th className="px-4 py-2.5">Họ tên</th>
                  <th className="px-4 py-2.5">SĐT</th>
                  <th className="px-4 py-2.5">Email</th>
                  <th className="px-4 py-2.5">Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-t border-line">
                    <td className="px-4 py-2.5 font-medium text-ink">{r.projects?.name ?? "(dự án đã xoá)"}</td>
                    <td className="px-4 py-2.5 text-graphite">{r.full_name}</td>
                    <td className="px-4 py-2.5 text-graphite">{r.phone}</td>
                    <td className="px-4 py-2.5 text-graphite/70">{r.email ?? "—"}</td>
                    <td className="px-4 py-2.5 text-graphite/70">
                      {new Date(r.created_at).toLocaleString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
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
                <Link
                  href={`/admin/lien-he?page=${page - 1}`}
                  className="rounded-full border border-line px-3.5 py-1.5 font-medium text-ink hover:bg-paper-dim"
                >
                  ← Trang trước
                </Link>
              ) : (
                <span className="rounded-full border border-line px-3.5 py-1.5 font-medium text-graphite/30">← Trang trước</span>
              )}
              {page < totalPages ? (
                <Link
                  href={`/admin/lien-he?page=${page + 1}`}
                  className="rounded-full border border-line px-3.5 py-1.5 font-medium text-ink hover:bg-paper-dim"
                >
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
