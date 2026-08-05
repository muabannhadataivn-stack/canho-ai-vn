import type { Metadata } from "next";
import { BackHeader } from "@/components/layout/BackHeader";

export const metadata: Metadata = { title: "Thông báo" };

// Dữ liệu mẫu — chưa có hệ thống thông báo thật ở phase này.
const SAMPLE_NOTIFICATIONS = [
  {
    id: "1",
    title: "Vinhomes Grand Park cập nhật giá",
    text: "Giá tham khảo phân khu S vừa được cập nhật.",
    time: "2 giờ trước",
    read: false,
  },
  {
    id: "2",
    title: "Vinhomes Smart City có mốc tiến độ mới",
    text: "Vừa cập nhật mốc dự kiến mở bán.",
    time: "Hôm qua",
    read: false,
  },
  {
    id: "3",
    title: "Dữ liệu khu vực Đồng Nai vừa được rà soát",
    text: "Hệ thống vừa cập nhật lại dữ liệu khu vực.",
    time: "3 ngày trước",
    read: true,
  },
];

export default function ThongBaoPage() {
  return (
    <div className="flex h-full flex-col bg-paper">
      <BackHeader title="Thông báo" />
      <p className="bg-paper-dim px-4 py-2 text-center text-[11.5px] text-graphite/50">
        Dữ liệu minh hoạ — chưa kết nối hệ thống thông báo thật
      </p>
      <div className="flex-1 divide-y divide-line overflow-y-auto">
        {SAMPLE_NOTIFICATIONS.map((n) => (
          <div key={n.id} className={`flex gap-2.5 px-4 py-3.5 ${n.read ? "opacity-55" : ""}`}>
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-line" : "bg-gold"}`} />
            <div>
              <div className="text-[13.5px] font-semibold text-ink">{n.title}</div>
              <div className="text-[12.5px] text-graphite/60">{n.text}</div>
              <div className="mt-0.5 font-mono text-[11px] text-graphite/40">{n.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
