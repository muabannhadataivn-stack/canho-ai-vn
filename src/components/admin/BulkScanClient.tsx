"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { findNearbyAmenities } from "@/lib/admin-actions";
import { OVERPASS_RATE_LIMIT_MARKER } from "@/lib/admin-constants";

export interface BulkScanItem {
  id: string;
  name: string;
  province: string;
  nearbyCount: number;
}

interface ScanLogEntry {
  id: string;
  name: string;
  ok: boolean;
  count?: number;
  error?: string;
}

// Nhận đúng danh sách dự án của TRANG HIỆN TẠI (đã lọc + phân trang ở server, xem
// page.tsx) — chọn/quét chỉ áp dụng trong phạm vi trang đang xem, không giữ lựa chọn
// khi chuyển trang (đơn giản, đủ dùng — không cần lưu trạng thái chọn xuyên trang).
export function BulkScanClient({ items }: { items: BulkScanItem[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number; name: string } | null>(null);
  const [log, setLog] = useState<ScanLogEntry[]>([]);
  const [summary, setSummary] = useState<{ success: number; failed: number } | null>(null);
  const [rateLimited, setRateLimited] = useState(false);

  // Cờ dừng — kiểm tra giữa các vòng lặp tuần tự, không cần AbortController.
  // LƯU Ý: không thể ngắt NGANG 1 lượt gọi findNearbyAmenities đang chạy dở (server-side,
  // có thể mất tới ~3s delay + fetch + tối đa 1 lần retry 5s + fetch nếu dính 429) — bấm
  // Dừng có tác dụng ngay khi lượt hiện tại vừa trả kết quả, không phải giữa chừng lượt đó.
  const stopRef = useRef(false);

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllVisible() {
    setSelected(new Set(items.map((i) => i.id)));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  async function handleScan() {
    const itemsById = new Map(items.map((i) => [i.id, i]));
    const ids = Array.from(selected);
    if (ids.length === 0) return;

    stopRef.current = false;
    setScanning(true);
    setLog([]);
    setSummary(null);
    setRateLimited(false);

    let success = 0;
    let failed = 0;
    let hitRateLimit = false;

    // Tuần tự — await từng dự án một, KHÔNG Promise.all song song, để không phá
    // vỡ rate-limit của Overpass API (src/lib/osm-places.ts).
    for (let i = 0; i < ids.length; i++) {
      if (stopRef.current) break;

      const item = itemsById.get(ids[i]!);
      setProgress({ current: i + 1, total: ids.length, name: item?.name ?? ids[i]! });

      const result = await findNearbyAmenities(ids[i]!);

      // Check lại NGAY khi lượt này vừa xong — nếu người dùng bấm Dừng trong lúc chờ,
      // dừng ngay tại đây thay vì phải chờ tới đầu vòng lặp kế tiếp.
      if (stopRef.current) break;

      if (result.ok) {
        success += 1;
        setLog((prev) => [
          ...prev,
          { id: ids[i]!, name: item?.name ?? ids[i]!, ok: true, count: result.amenities?.length ?? 0 },
        ]);
      } else if (result.error?.includes(OVERPASS_RATE_LIMIT_MARKER)) {
        // Lỗi 429 liên tiếp (đã retry) là dấu hiệu đang bị chặn tốc độ — dừng HẲN, không
        // tiếp tục quét dự án tiếp theo, khác với lỗi đơn lẻ (bỏ qua, chạy tiếp).
        failed += 1;
        setLog((prev) => [...prev, { id: ids[i]!, name: item?.name ?? ids[i]!, ok: false, error: result.error }]);
        hitRateLimit = true;
        break;
      } else {
        // Lỗi đơn lẻ (VD dự án không quét ra tiện ích nào có tên) — bỏ qua, tiếp tục.
        failed += 1;
        setLog((prev) => [...prev, { id: ids[i]!, name: item?.name ?? ids[i]!, ok: false, error: result.error }]);
      }
    }

    setScanning(false);
    setProgress(null);
    setSummary({ success, failed });
    setRateLimited(hitRateLimit);
    router.refresh(); // cập nhật lại số tiện ích/bộ lọc "chưa quét" theo dữ liệu mới
  }

  function handleStop() {
    stopRef.current = true;
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white p-4">
        <span className="text-[12.5px] text-graphite/50">{items.length} dự án ở trang này</span>

        <button
          type="button"
          onClick={selectAllVisible}
          disabled={scanning || items.length === 0}
          className="ml-auto rounded-full border border-line px-3.5 py-1.5 text-[13px] font-medium text-ink hover:bg-paper-dim disabled:opacity-60"
        >
          Chọn tất cả đang hiển thị
        </button>
        <button
          type="button"
          onClick={clearSelection}
          disabled={scanning || selected.size === 0}
          className="rounded-full border border-line px-3.5 py-1.5 text-[13px] font-medium text-graphite hover:bg-paper-dim disabled:opacity-60"
        >
          Bỏ chọn
        </button>
      </div>

      <div className="mb-4 overflow-hidden rounded-2xl border border-line bg-white">
        <table className="w-full text-left text-[13.5px]">
          <thead className="bg-paper-dim text-[12px] uppercase tracking-wide text-graphite/60">
            <tr>
              <th className="w-10 px-4 py-2.5" />
              <th className="px-4 py-2.5">Tên dự án</th>
              <th className="px-4 py-2.5">Tỉnh/thành</th>
              <th className="px-4 py-2.5">Tiện ích lân cận</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-line">
                <td className="px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked={selected.has(item.id)}
                    onChange={() => toggleOne(item.id)}
                    disabled={scanning}
                  />
                </td>
                <td className="px-4 py-2.5 font-medium text-ink">{item.name}</td>
                <td className="px-4 py-2.5 text-graphite">{item.province}</td>
                <td className="px-4 py-2.5 text-graphite/70">{item.nearbyCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-line bg-white p-4">
        <div className="mb-3 flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleScan}
            disabled={scanning || selected.size === 0}
            className="rounded-xl bg-gold px-4 py-2.5 text-[13.5px] font-semibold text-ink disabled:opacity-60"
          >
            {scanning ? "Đang quét..." : `Quét tiện ích cho ${selected.size} dự án đã chọn`}
          </button>
          {scanning && (
            <button
              type="button"
              onClick={handleStop}
              className="rounded-xl border border-line px-4 py-2.5 text-[13.5px] font-semibold text-red hover:bg-paper-dim"
            >
              Dừng
            </button>
          )}
        </div>

        {progress && (
          <div className="mb-3">
            <div className="mb-1 text-[12.5px] text-graphite/70">
              Đang quét {progress.current}/{progress.total}: {progress.name}...
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-paper-dim">
              <div
                className="h-full rounded-full bg-gold transition-all"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {rateLimited && (
          <p className="mb-3 rounded-xl border border-red/30 bg-red/5 p-3 text-[13px] font-semibold text-red">
            Overpass API đang giới hạn tốc độ, dừng lại để tránh bị chặn IP. Vui lòng đợi vài phút rồi thử lại.
          </p>
        )}

        {summary && (
          <p className="mb-3 text-[13.5px] font-semibold text-ink">
            Hoàn tất: {summary.success} thành công, {summary.failed} lỗi/bỏ qua.
          </p>
        )}

        {log.length > 0 && (
          <div className="max-h-64 overflow-y-auto rounded-xl border border-line bg-paper p-2.5 text-[12.5px]">
            {log.map((entry) => (
              <div key={entry.id} className="flex justify-between gap-2 py-0.5">
                <span className="text-ink/80">{entry.name}</span>
                {entry.ok ? (
                  <span className="shrink-0 text-green">Tìm được {entry.count} tiện ích</span>
                ) : (
                  <span className="shrink-0 text-red">{entry.error ?? "Lỗi"}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
