import type { SalesStatus } from "@/lib/types";

const STATUS_CONFIG: Record<SalesStatus, { label: string; classes: string }> = {
  "dang-mo-ban": { label: "Đang mở bán", classes: "bg-green/10 text-green" },
  "sap-mo-ban": { label: "Sắp mở bán", classes: "bg-blueprint/10 text-blueprint" },
  "da-ban-giao": { label: "Đã bàn giao", classes: "bg-ink/10 text-ink/70" },
  // Badge màu xám trung tính — KHÔNG suy diễn thành 1 trong 3 trạng thái còn lại.
  "dang-cap-nhat": { label: "Đang cập nhật", classes: "bg-line/60 text-graphite/60" },
};

export function StatusBadge({ status }: { status: SalesStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${config.classes}`}>
      {config.label}
    </span>
  );
}
