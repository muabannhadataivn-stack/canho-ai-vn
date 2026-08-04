"use client";

import { useEffect, useState } from "react";

const TABS = [
  { id: "section-tong-quan", label: "Tổng quan" },
  { id: "section-tien-do", label: "Tiến độ" },
  { id: "section-vi-tri", label: "Vị trí" },
];

export function DetailTabsNav() {
  const [active, setActive] = useState(TABS[0]!.id);

  useEffect(() => {
    const elements = TABS.map((t) => document.getElementById(t.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="sticky top-0 z-10 flex gap-1 border-b border-line bg-paper/95 px-3 py-2 backdrop-blur">
      {TABS.map((tab) => (
        <a
          key={tab.id}
          href={`#${tab.id}`}
          className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
            active === tab.id ? "bg-ink text-paper" : "text-ink/50"
          }`}
        >
          {tab.label}
        </a>
      ))}
    </nav>
  );
}
