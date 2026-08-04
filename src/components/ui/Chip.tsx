import Link from "next/link";
import type { ReactNode } from "react";

interface ChipProps {
  children: ReactNode;
  active?: boolean;
  href?: string;
  onClick?: () => void;
}

export function Chip({ children, active, href, onClick }: ChipProps) {
  const classes = [
    "inline-flex items-center whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
    active
      ? "border-gold bg-gold text-ink"
      : "border-line bg-white text-ink/70 hover:border-ink/30",
  ].join(" ");

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
