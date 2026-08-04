"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Khám phá",
    icon: (
      <path d="M3 9l7-6 7 6v8a1 1 0 01-1 1h-4v-6H8v6H4a1 1 0 01-1-1V9z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    ),
  },
  {
    href: "/khu-vuc",
    label: "Khu vực",
    icon: (
      <>
        <path d="M10 2C6.5 2 4 4.7 4 8c0 4.5 6 10 6 10s6-5.5 6-10c0-3.3-2.5-6-6-6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="10" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.6" />
      </>
    ),
  },
  {
    href: "/so-sanh",
    label: "So sánh",
    icon: (
      <>
        <rect x="3" y="4" width="6" height="13" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
        <rect x="11" y="7" width="6" height="10" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
      </>
    ),
  },
  {
    href: "/da-luu",
    label: "Đã lưu",
    icon: (
      <path d="M10 17s-6.5-4-6.5-8.5A3.5 3.5 0 0110 6a3.5 3.5 0 016.5 2.5C16.5 13 10 17 10 17z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="flex shrink-0 border-t border-line bg-white" aria-label="Điều hướng chính">
      {NAV_ITEMS.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-1 flex-col items-center gap-[3px] px-1 pb-3 pt-2 text-[11px] font-medium ${
              active ? "text-ink" : "text-graphite/50"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className={active ? "text-gold" : undefined}>
              {item.icon}
            </svg>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
