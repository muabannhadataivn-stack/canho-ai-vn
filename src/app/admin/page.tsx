import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import { UNRESOLVED_PROVINCE } from "@/lib/province-normalize";
import { AdminOverviewChart, type ChartPoint } from "@/components/admin/AdminOverviewChart";

// Bắt buộc fetch luôn tươi — trang tổng quan phải phản ánh đúng số liệu mới nhất mỗi lần
// admin vào /admin, không được phục vụ response cache từ request trước.
export const dynamic = "force-dynamic";

const CHART_DAYS = 7;

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function toDisplayLabel(dateKey: string): string {
  const [, month, day] = dateKey.split("-");
  return `${day}/${month}`;
}

export default async function AdminOverviewPage() {
  const now = new Date();
  const todayKey = toDateKey(now);

  const rangeStart = new Date(now);
  rangeStart.setUTCDate(rangeStart.getUTCDate() - (CHART_DAYS - 1));
  rangeStart.setUTCHours(0, 0, 0, 0);

  const [
    { count: totalProjects },
    { count: publishedProjects },
    { count: draftProjects },
    { count: unresolvedProvinceProjects },
    { count: totalContacts },
    { data: recentContacts, error: recentContactsError },
  ] = await Promise.all([
    supabaseServer.from("projects").select("*", { count: "exact", head: true }),
    supabaseServer.from("projects").select("*", { count: "exact", head: true }).eq("publication_status", "published"),
    supabaseServer.from("projects").select("*", { count: "exact", head: true }).eq("publication_status", "draft"),
    supabaseServer.from("projects").select("*", { count: "exact", head: true }).eq("province_slug", UNRESOLVED_PROVINCE.slug),
    supabaseServer.from("contact_requests").select("*", { count: "exact", head: true }),
    // Lấy đủ 7 ngày gần nhất 1 lần — "hôm nay" đã nằm trong khoảng này, không cần query riêng.
    supabaseServer.from("contact_requests").select("created_at").gte("created_at", rangeStart.toISOString()),
  ]);
  if (recentContactsError) throw recentContactsError;

  const countByDay = new Map<string, number>();
  for (let i = 0; i < CHART_DAYS; i++) {
    const d = new Date(rangeStart);
    d.setUTCDate(d.getUTCDate() + i);
    countByDay.set(toDateKey(d), 0);
  }

  let todayCount = 0;
  for (const row of recentContacts ?? []) {
    const dayKey = row.created_at.slice(0, 10);
    if (countByDay.has(dayKey)) countByDay.set(dayKey, (countByDay.get(dayKey) ?? 0) + 1);
    if (dayKey === todayKey) todayCount += 1;
  }

  const chartData: ChartPoint[] = Array.from(countByDay.entries()).map(([dateKey, count]) => ({
    label: toDisplayLabel(dateKey),
    count,
  }));
  const last7DaysCount = (recentContacts ?? []).length;

  return (
    <div>
      <h1 className="mb-5 font-display text-[19px] font-bold text-ink">Tổng quan</h1>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-line bg-white p-4">
          <div className="mb-3 font-display text-[14px] font-bold text-ink">Dự án</div>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Tổng số" value={totalProjects ?? 0} />
            <Stat label="Đã publish" value={publishedProjects ?? 0} />
            <Stat label="Draft" value={draftProjects ?? 0} />
            <Stat label="Chưa xác định tỉnh" value={unresolvedProvinceProjects ?? 0} />
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-4">
          <div className="mb-3 font-display text-[14px] font-bold text-ink">Liên hệ tư vấn</div>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Tổng số" value={totalContacts ?? 0} />
            <Stat label="7 ngày qua" value={last7DaysCount} />
            <Stat label="Hôm nay" value={todayCount} />
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-line bg-white p-4">
        <div className="mb-1 font-display text-[14px] font-bold text-ink">Lượt đăng ký tư vấn 7 ngày qua</div>
        <AdminOverviewChart data={chartData} />
      </div>

      <div>
        <div className="mb-2 font-display text-[14px] font-bold text-ink">Lối tắt</div>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/admin/du-an"
            className="rounded-2xl border border-line bg-white p-4 text-[13.5px] font-semibold text-ink hover:bg-paper-dim"
          >
            Quản lý dự án →
          </Link>
          <Link
            href="/admin/lien-he"
            className="rounded-2xl border border-line bg-white p-4 text-[13.5px] font-semibold text-ink hover:bg-paper-dim"
          >
            Liên hệ tư vấn →
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="font-display text-[20px] font-bold text-ink">{value}</div>
      <div className="text-[11.5px] text-graphite/55">{label}</div>
    </div>
  );
}
