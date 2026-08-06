import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import { BulkScanClient, type BulkScanItem } from "@/components/admin/BulkScanClient";

// Bắt buộc fetch luôn tươi — số tiện ích lân cận/bộ lọc "chưa quét" phải phản ánh
// đúng trạng thái mới nhất sau mỗi lần quét (xem admin/du-an/page.tsx cho cùng lý do).
export const dynamic = "force-dynamic";

// Với ~1843 dự án trong DB, KHÔNG được liệt kê toàn bộ id vào .in(...) — PostgREST
// từ chối query có mệnh đề IN(...) quá dài (đã gặp lỗi "Bad Request" thật). Cách tránh:
// 1) Phân trang — chỉ đếm tiện ích cho ≤ PAGE_SIZE id của trang hiện tại (.in() ngắn, an toàn).
// 2) Lọc "chỉ dự án có lat/lng" qua JOIN embedded (project_location!inner) thay vì .in(danh
//    sách toàn bộ id có toạ độ) — PostgREST lọc thẳng ở tầng SQL, không cần liệt kê id.
// 3) Lọc "chưa quét" qua NOT IN danh sách id ĐÃ quét (thường ngắn hơn nhiều vì đa số dự án
//    chưa quét) thay vì liệt kê toàn bộ id chưa quét.
const PAGE_SIZE = 30;

export default async function BulkScanPage({
  searchParams,
}: {
  searchParams: { page?: string; filter?: string };
}) {
  const page = Math.max(1, Math.floor(Number(searchParams.page)) || 1);
  const onlyUnscanned = searchParams.filter !== "all";
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Danh sách id ĐÃ quét (có ít nhất 1 dòng project_nearby_amenities) — không lọc theo id
  // nào cả nên an toàn bất kể kích thước bảng, chỉ dùng để loại trừ khi lọc "chưa quét".
  const scannedIds = new Set<string>();
  if (onlyUnscanned) {
    const { data: scannedRows, error: scannedError } = await supabaseServer
      .from("project_nearby_amenities")
      .select("project_id");
    if (scannedError) throw scannedError;
    for (const row of scannedRows ?? []) scannedIds.add(row.project_id as string);
  }

  // 2 nhánh tách biệt (không reassign biến query) — tránh lỗi TS2589 "Type instantiation
  // excessively deep" của supabase-js khi gọi .not() có điều kiện trên cùng 1 biến.
  const baseSelect = "id, name, province, project_location!inner(lat, lng)" as const;
  const excludeScanned = onlyUnscanned && scannedIds.size > 0;

  const { data: projectRows, error: projectError, count } = excludeScanned
    ? await supabaseServer
        .from("projects")
        .select(baseSelect, { count: "exact" })
        .not("project_location.lat", "is", null)
        .not("project_location.lng", "is", null)
        .not("id", "in", `(${Array.from(scannedIds).join(",")})`)
        .order("name", { ascending: true })
        .range(from, to)
    : await supabaseServer
        .from("projects")
        .select(baseSelect, { count: "exact" })
        .not("project_location.lat", "is", null)
        .not("project_location.lng", "is", null)
        .order("name", { ascending: true })
        .range(from, to);
  if (projectError) throw projectError;

  const pageIds = (projectRows ?? []).map((p) => p.id as string);

  // Đếm tiện ích lân cận CHỈ cho ≤ PAGE_SIZE id của trang này — .in() ngắn, an toàn.
  const countByProject = new Map<string, number>();
  if (pageIds.length > 0) {
    const { data: nearbyRows, error: nearbyError } = await supabaseServer
      .from("project_nearby_amenities")
      .select("project_id")
      .in("project_id", pageIds);
    if (nearbyError) throw nearbyError;
    for (const row of nearbyRows ?? []) {
      const pid = row.project_id as string;
      countByProject.set(pid, (countByProject.get(pid) ?? 0) + 1);
    }
  }

  const items: BulkScanItem[] = (projectRows ?? []).map((p) => ({
    id: p.id as string,
    name: p.name as string,
    province: p.province as string,
    nearbyCount: countByProject.get(p.id as string) ?? 0,
  }));

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-[19px] font-bold text-ink">
            Quét tiện ích hàng loạt <span className="text-graphite/50">— {totalCount} dự án</span>
          </h1>
          <p className="mt-0.5 text-[12.5px] text-graphite/50">Chỉ dự án có toạ độ (lat/lng) hợp lệ mới quét được.</p>
        </div>
        <Link href="/admin/du-an" className="text-[13px] font-medium text-blueprint">
          ← Danh sách dự án
        </Link>
      </div>

      <div className="mb-4 flex gap-2">
        <Link
          href="/admin/du-an/tien-ich-hang-loat?filter=unscanned"
          className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium ${
            onlyUnscanned ? "bg-ink text-paper" : "border border-line text-ink hover:bg-paper-dim"
          }`}
        >
          Chỉ hiện dự án chưa quét
        </Link>
        <Link
          href="/admin/du-an/tien-ich-hang-loat?filter=all"
          className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium ${
            !onlyUnscanned ? "bg-ink text-paper" : "border border-line text-ink hover:bg-paper-dim"
          }`}
        >
          Hiện tất cả
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-[14px] text-graphite/60">
          {onlyUnscanned ? "Không còn dự án nào chưa quét ở bộ lọc này." : "Chưa có dự án nào có toạ độ (lat/lng) hợp lệ."}
        </p>
      ) : (
        <>
          <BulkScanClient items={items} />

          <div className="mt-4 flex items-center justify-between text-[13px]">
            <span className="text-graphite/60">
              Trang {page}/{totalPages}
            </span>
            <div className="flex gap-2">
              {page > 1 ? (
                <Link
                  href={`/admin/du-an/tien-ich-hang-loat?page=${page - 1}&filter=${onlyUnscanned ? "unscanned" : "all"}`}
                  className="rounded-full border border-line px-3.5 py-1.5 font-medium text-ink hover:bg-paper-dim"
                >
                  ← Trang trước
                </Link>
              ) : (
                <span className="rounded-full border border-line px-3.5 py-1.5 font-medium text-graphite/30">← Trang trước</span>
              )}
              {page < totalPages ? (
                <Link
                  href={`/admin/du-an/tien-ich-hang-loat?page=${page + 1}&filter=${onlyUnscanned ? "unscanned" : "all"}`}
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
