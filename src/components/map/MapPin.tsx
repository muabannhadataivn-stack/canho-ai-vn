import type { SalesStatus } from "@/lib/types";

const STATUS_COLOR: Record<SalesStatus, string> = {
  "dang-mo-ban": "bg-green",
  "sap-mo-ban": "bg-blueprint",
  "da-ban-giao": "bg-ink/60",
  "dang-cap-nhat": "bg-graphite/40",
};

export function MapPin({
  label,
  status,
  style,
  onClick,
  active,
}: {
  label: string;
  status: SalesStatus;
  style: { left: string; top: string };
  onClick: () => void;
  active: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      aria-label={label}
      className={`absolute flex h-7 w-7 -translate-x-1/2 -translate-y-full items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white shadow-md ${STATUS_COLOR[status]} ${
        active ? "ring-2 ring-gold" : ""
      }`}
    >
      {label}
    </button>
  );
}
